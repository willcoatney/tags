import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'
import Stripe from 'stripe'

// Disable body parsing — we need the raw body for Stripe signature verification
export const dynamic = 'force-dynamic'

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
])

function mapStatus(sub: Stripe.Subscription): string {
  // Stripe statuses: active, past_due, canceled, unpaid, trialing, paused, incomplete, incomplete_expired
  if (sub.status === 'active' || sub.status === 'trialing') return 'active'
  if (sub.status === 'canceled' || sub.status === 'incomplete_expired') return 'inactive'
  return sub.status // past_due, unpaid, paused, incomplete — surface as-is
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true })
  }

  const supabase = createAdminClient()

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as Stripe.Subscription
    const orgId = sub.metadata?.organization_id

    if (!orgId) {
      console.error('Webhook: no organization_id in subscription metadata', sub.id)
      return NextResponse.json({ error: 'Missing organization_id' }, { status: 400 })
    }

    const newStatus = mapStatus(sub)

    const { error } = await supabase
      .from('organizations')
      .update({
        stripe_subscription_id: sub.id,
        subscription_status: newStatus,
      })
      .eq('id', orgId)

    if (error) {
      console.error('Webhook: failed to update org subscription status', error)
      void logError(ErrorCategory.DB, 'Webhook: failed to update org subscription status', {
        err: error.message, orgId, subscriptionId: sub.id, newStatus,
      }, { route: '/api/stripe/webhook', severity: ErrorSeverity.CRITICAL })
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    console.log(`Webhook: org ${orgId} → subscription_status=${newStatus}`)
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    if (customerId) {
      const { error } = await supabase
        .from('organizations')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Webhook: failed to update past_due status', error)
        void logError(ErrorCategory.DB, 'Webhook: failed to update past_due subscription status — billing integrity risk', {
          err: error.message, stripeCustomerId: customerId,
        }, { route: '/api/stripe/webhook', severity: ErrorSeverity.CRITICAL })
        // H-05: Return 500 so Stripe retries this event
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
