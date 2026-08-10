/**
 * Platform fee charging logic — 1.5% of bid amount, minimum $1.00
 * Used by: award route (initial charge) and retry-fee route (admin retry)
 *
 * Soft gate: award always succeeds; fee failure never blocks the workflow.
 */

import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { sendEmail } from '@/lib/email'
import { feeChargedEmail, feeDeclinedEmail } from '@/lib/email-templates/platform-fees'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'
import { getBaseUrl } from '@/lib/url'

export const PLATFORM_FEE_RATE = 0.015 // 1.5%
export const PLATFORM_FEE_MIN_CENTS = 100 // $1.00 minimum

export type FeeChargeResult =
  | { status: 'charged'; paymentIntentId: string; feeCents: number; cardLast4: string }
  | { status: 'failed';  feeCents: number; reason: string }
  | { status: 'pending'; reason: string }

interface BidInfo {
  id: string
  amount: number        // bid amount in dollars
  project_id: string
  contractor_user_id: string
}

interface ProjectInfo {
  title: string
}

/**
 * Attempts to charge the 1.5% platform fee for a winning bid.
 * Updates bid record with the result regardless of outcome.
 * Sends SMS + email notifications.
 *
 * Returns a FeeChargeResult describing the outcome.
 */
export async function chargePlatformFee(
  bid: BidInfo,
  project: ProjectInfo,
  routeContext: { route: string; user_id?: string }
): Promise<FeeChargeResult> {
  const admin = createAdminClient()
  const stripe = getStripe()

  const feeCents = Math.max(
    PLATFORM_FEE_MIN_CENTS,
    Math.round(bid.amount * PLATFORM_FEE_RATE * 100),
  )
  const feeDisplay = `$${(feeCents / 100).toFixed(2)}`

  // ── Look up contractor org ─────────────────────────────────────────────
  const { data: contractorProfile } = await admin
    .from('user_profiles')
    .select('organization_id, phone, email, full_name')
    .eq('id', bid.contractor_user_id)
    .single()

  if (!contractorProfile?.organization_id) {
    await markFeePending(admin, bid.id, feeCents, 'No contractor organization found')
    void logError(ErrorCategory.STRIPE, 'Platform fee skipped — no contractor org', {
      bidId: bid.id,
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.MEDIUM })
    await notifyPendingPayment(contractorProfile ?? {}, project.title, feeDisplay)
    return { status: 'pending', reason: 'No contractor organization found' }
  }

  const { data: contractorOrg } = await admin
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', contractorProfile.organization_id)
    .single()

  if (!contractorOrg?.stripe_customer_id) {
    await markFeePending(admin, bid.id, feeCents, 'No Stripe customer on contractor org')
    void logError(ErrorCategory.STRIPE, 'Platform fee pending — contractor has no Stripe customer', {
      bidId: bid.id, orgId: contractorProfile.organization_id,
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.MEDIUM })
    await notifyPendingPayment(contractorProfile, project.title, feeDisplay)
    return { status: 'pending', reason: 'No Stripe customer ID on file' }
  }

  const stripeCustomerId = contractorOrg.stripe_customer_id

  // ── Get default payment method ─────────────────────────────────────────
  let paymentMethodId: string | null = null
  let cardLast4 = 'unknown'

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
      limit: 1,
    })

    if (paymentMethods.data.length > 0) {
      paymentMethodId = paymentMethods.data[0].id
      cardLast4 = paymentMethods.data[0].card?.last4 ?? 'unknown'
    }
  } catch (pmErr) {
    void logError(ErrorCategory.STRIPE, 'Failed to list payment methods for contractor', {
      bidId: bid.id, stripeCustomerId,
      err: pmErr instanceof Error ? pmErr.message : String(pmErr),
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.HIGH })
  }

  if (!paymentMethodId) {
    await markFeePending(admin, bid.id, feeCents, 'No card on file')
    void logError(ErrorCategory.STRIPE, 'Platform fee pending — no payment method on file', {
      bidId: bid.id, stripeCustomerId,
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.MEDIUM })
    await notifyPendingPayment(contractorProfile, project.title, feeDisplay)
    return { status: 'pending', reason: 'No payment method on file' }
  }

  // ── Attempt PaymentIntent ──────────────────────────────────────────────
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: feeCents,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description: `TAGS platform fee — Project: ${project.title}`,
      metadata: {
        bid_id: bid.id,
        project_id: bid.project_id,
        contractor_org_id: contractorProfile.organization_id,
      },
    })

    // ── Check final status ─────────────────────────────────────────────
    if (paymentIntent.status === 'succeeded') {
      const { error: updateErr } = await admin.from('bids').update({
        stripe_charge_id: paymentIntent.id,
        platform_fee_cents: feeCents,
        platform_fee_status: 'charged',
        platform_fee_charged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', bid.id)

      if (updateErr) {
        void logError(ErrorCategory.DB, 'Failed to persist charged fee status', {
          bidId: bid.id, updateErr: updateErr.message, paymentIntentId: paymentIntent.id,
        }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.HIGH })
      }

      // Notify contractor of successful charge
      if (contractorProfile.email) {
        const { subject, html } = feeChargedEmail(project.title, feeDisplay, cardLast4)
        await sendEmail(contractorProfile.email, subject, html)
      }

      return { status: 'charged', paymentIntentId: paymentIntent.id, feeCents, cardLast4 }
    }

    // PaymentIntent created but not succeeded (e.g. requires_action)
    const reason = `PaymentIntent status: ${paymentIntent.status}`
    await markFeeFailed(admin, bid.id, feeCents, reason)
    void logError(ErrorCategory.STRIPE, 'Platform fee PaymentIntent not succeeded', {
      bidId: bid.id, status: paymentIntent.status, paymentIntentId: paymentIntent.id,
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.HIGH })
    await notifyDeclinedPayment(contractorProfile, project.title, feeDisplay)
    return { status: 'failed', feeCents, reason }

  } catch (stripeErr) {
    const reason = stripeErr instanceof Error ? stripeErr.message : String(stripeErr)
    await markFeeFailed(admin, bid.id, feeCents, reason)
    void logError(ErrorCategory.STRIPE, 'Platform fee charge failed — card declined or Stripe error', {
      bidId: bid.id, stripeCustomerId, paymentMethodId,
      err: reason,
      stripeCode: (stripeErr as Stripe.StripeRawError)?.code,
      stripeDeclineCode: (stripeErr as Stripe.StripeRawError)?.decline_code,
    }, { route: routeContext.route, user_id: routeContext.user_id, severity: ErrorSeverity.HIGH })
    await notifyDeclinedPayment(contractorProfile, project.title, feeDisplay)
    return { status: 'failed', feeCents, reason }
  }
}

// ── Internal helpers ─────────────────────────────────────────────────────

type AdminClient = ReturnType<typeof createAdminClient>

async function markFeePending(admin: AdminClient, bidId: string, feeCents: number, reason: string) {
  const { error } = await admin.from('bids').update({
    platform_fee_status: 'pending',
    platform_fee_cents: feeCents,
    updated_at: new Date().toISOString(),
  }).eq('id', bidId)
  if (error) console.error('[platform-fee] Failed to mark pending:', reason, error)
}

async function markFeeFailed(admin: AdminClient, bidId: string, feeCents: number, reason: string) {
  const { error } = await admin.from('bids').update({
    platform_fee_status: 'failed',
    platform_fee_cents: feeCents,
    platform_fee_failed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', bidId)
  if (error) console.error('[platform-fee] Failed to mark failed:', reason, error)
}

interface ContractorContact {
  phone?: string | null
  email?: string | null
  full_name?: string | null
}

async function notifyDeclinedPayment(contractor: ContractorContact, projectTitle: string, feeDisplay: string) {
  const billingUrl = `${getBaseUrl()}/dashboard/billing`
  if (contractor.phone) {
    try {
      await sendSMS(
        contractor.phone,
        `TAGS: Your platform fee of ${feeDisplay} for "${projectTitle}" could not be processed. Update your payment method: ${billingUrl}`,
      )
    } catch (e) {
      console.error('[platform-fee] Declined SMS failed:', e)
    }
  }
  if (contractor.email) {
    const { subject, html } = feeDeclinedEmail(projectTitle, feeDisplay, billingUrl)
    await sendEmail(contractor.email, subject, html)
  }
}

async function notifyPendingPayment(contractor: ContractorContact, projectTitle: string, feeDisplay: string) {
  const billingUrl = `${getBaseUrl()}/dashboard/billing`
  if (contractor.phone) {
    try {
      await sendSMS(
        contractor.phone,
        `TAGS: A platform fee of ${feeDisplay} for "${projectTitle}" is pending. Add a payment method: ${billingUrl}`,
      )
    } catch (e) {
      console.error('[platform-fee] Pending SMS failed:', e)
    }
  }
  if (contractor.email) {
    const { subject, html } = feeDeclinedEmail(projectTitle, feeDisplay, billingUrl)
    await sendEmail(contractor.email, subject, html)
  }
}
