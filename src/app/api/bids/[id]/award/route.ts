import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { sendEmail, awardedWinnerEmail } from '@/lib/email'
import { getStripe } from '@/lib/stripe'

const PLATFORM_FEE_RATE = 0.015 // 1.5%

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: winningBid } = await admin.from('bids')
    .select('*, projects(*, properties(*))')
    .eq('id', params.id)
    .single()

  if (!winningBid) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: pmProfile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!pmProfile || pmProfile.role !== 'pm' ||
      pmProfile.organization_id !== winningBid.projects.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Award winning bid
  await admin.from('bids').update({ status: 'awarded', updated_at: new Date().toISOString() }).eq('id', params.id)

  // Reject all other bids
  const { data: losingBids } = await admin.from('bids')
    .select('id, contractor_user_id')
    .eq('project_id', winningBid.project_id)
    .neq('id', params.id)

  if (losingBids?.length) {
    await admin.from('bids')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .in('id', losingBids.map(b => b.id))
  }

  // Update project status
  await admin.from('projects')
    .update({ status: 'awarded', updated_at: new Date().toISOString() })
    .eq('id', winningBid.project_id)

  // ── Charge contractor 1.5% platform fee ─────────────────────────────────
  try {
    const { data: contractorProfile } = await admin.from('user_profiles')
      .select('organization_id')
      .eq('id', winningBid.contractor_user_id)
      .single()

    if (contractorProfile?.organization_id) {
      const { data: contractorOrg } = await admin.from('organizations')
        .select('stripe_customer_id, subscription_status')
        .eq('id', contractorProfile.organization_id)
        .single()

      if (contractorOrg?.stripe_customer_id && contractorOrg.subscription_status === 'active') {
        const stripe = getStripe()
        const bidAmountCents = Math.round(winningBid.amount * 100)
        const feeCents = Math.round(bidAmountCents * PLATFORM_FEE_RATE)

        // Create invoice item then auto-advance invoice → charges immediately
        await stripe.invoiceItems.create({
          customer: contractorOrg.stripe_customer_id,
          amount: feeCents,
          currency: 'usd',
          description: `TAGS platform fee (1.5%) — "${winningBid.projects.title}" ($${winningBid.amount.toLocaleString()})`,
          metadata: {
            bid_id: winningBid.id,
            project_id: winningBid.project_id,
            bid_amount_cents: bidAmountCents,
          },
        })

        // Retrieve the customer's default payment method — enforce card only for per-job
        // charges. ACH takes 3–5 days to settle and can bounce late; cards are instant.
        const customer = await stripe.customers.retrieve(contractorOrg.stripe_customer_id) as import('stripe').default.Customer
        const defaultPm = customer.invoice_settings?.default_payment_method as string | null

        const invoice = await stripe.invoices.create({
          customer: contractorOrg.stripe_customer_id,
          auto_advance: true,
          collection_method: 'charge_automatically',
          // Pin to explicit card payment method if available
          ...(defaultPm ? { default_payment_method: defaultPm } : {}),
          payment_settings: {
            payment_method_types: ['card'], // never ACH for per-job fees
          },
          metadata: {
            bid_id: winningBid.id,
            project_id: winningBid.project_id,
          },
        })

        // Finalize + pay immediately
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)
        // Pay the finalized invoice (charges the customer's default payment method)
        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id)

        // Record charge on the bid — use invoice ID as the stable reference
        await admin.from('bids').update({
          stripe_charge_id: paidInvoice.id,
          platform_fee_cents: feeCents,
        }).eq('id', params.id)
      }
    }
  } catch (err) {
    // Log but don't fail the award — billing issues shouldn't block project flow
    console.error('Platform fee charge failed for bid', params.id, err)
  }
  // ────────────────────────────────────────────────────────────────────────

  const baseUrl = getBaseUrl()
  const projectUrl = `${baseUrl}/dashboard/contractor/projects/${winningBid.project_id}`
  const { title, properties } = winningBid.projects

  // Notify winning contractor
  const { data: winner } = await admin.from('user_profiles')
    .select('phone, email, full_name')
    .eq('id', winningBid.contractor_user_id)
    .single()

  if (winner?.phone) {
    await sendSMS(winner.phone, `You've been awarded "${title}" in ${properties.city}. Login for details: ${projectUrl}`)
  }
  if (winner?.email) {
    const { subject, html } = awardedWinnerEmail(title, properties.city, projectUrl)
    await sendEmail(winner.email, subject, html)
  }

  // Notify losing contractors
  for (const loser of (losingBids || [])) {
    const { data: loserProfile } = await admin.from('user_profiles')
      .select('phone, email')
      .eq('id', loser.contractor_user_id)
      .single()
    if (loserProfile?.phone) {
      await sendSMS(loserProfile.phone, `"${title}" has been awarded to another contractor. Watch for new projects on TAGS.`)
    }
  }

  return NextResponse.json({ success: true })
}
