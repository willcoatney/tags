import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile to determine role and organization
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .eq('id', profile.organization_id)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const stripe = getStripe()

  // Re-use existing Stripe customer or create a new one
  let customerId = org.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: {
        organization_id: org.id,
        role: profile.role,
      },
    })
    customerId = customer.id

    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', org.id)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.tagyourproject.com'
  const isContractor = profile.role === 'contractor'

  // Route to correct Stripe price based on role
  const priceId = isContractor
    ? process.env.STRIPE_CONTRACTOR_PRICE_ID!   // $100/year
    : process.env.STRIPE_PM_PRICE_ID!            // $50/month

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    // Offer both card and ACH bank account.
    // Note: per-job contractor fees (1.5%) are always charged to the card saved at checkout
    // regardless of which method is used here — ACH settlement delay makes it unsuitable
    // for real-time job charges.
    payment_method_types: ['card', 'us_bank_account'],
    // Collect payment method so we can charge per-job fees off-session (card only)
    payment_method_collection: 'always',
    subscription_data: {
      metadata: { organization_id: org.id, role: profile.role },
    },
    success_url: `${baseUrl}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
