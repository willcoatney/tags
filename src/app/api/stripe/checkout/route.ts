import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

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
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('Checkout: user_profiles lookup failed', profileError)
    return NextResponse.json({ error: 'User profile not found. Please contact support.' }, { status: 404 })
  }

  if (!profile.organization_id) {
    console.error('Checkout: user has no organization_id', user.id)
    return NextResponse.json({ error: 'No organization linked to this account. Please contact support.' }, { status: 404 })
  }

  // Fetch org — select only base columns first to avoid failing if stripe migration hasn't run
  const { data: orgBase, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', profile.organization_id)
    .single()

  if (orgError || !orgBase) {
    console.error('Checkout: organizations lookup failed', orgError)
    return NextResponse.json({ error: 'Organization record not found. Please contact support.' }, { status: 404 })
  }

  // Fetch stripe columns separately (requires migration 20260808_stripe_billing.sql to be run)
  const { data: orgStripe } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', profile.organization_id)
    .single()

  const org = { ...orgBase, stripe_customer_id: orgStripe?.stripe_customer_id ?? null }

  if (!orgStripe) {
    console.warn('Checkout: stripe columns not found on org — has 20260808_stripe_billing.sql been run in Supabase?')
  }

  // H-03: Wrap all Stripe API calls in try/catch
  try {
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

      // H-03: Check Stripe customer ID save — failure here creates duplicate customers
      const { error: custErr } = await supabase
        .from('organizations')
        .update({ stripe_customer_id: customerId })
        .eq('id', org.id)
      if (custErr) {
        console.error('Checkout: Failed to save stripe_customer_id:', custErr)
        void logError(ErrorCategory.DB, 'Failed to save stripe_customer_id to org — duplicate customer risk', {
          custErr: custErr.message, orgId: org.id, stripeCustomerId: customerId,
        }, { route: '/api/stripe/checkout', user_id: user.id, severity: ErrorSeverity.HIGH })
      }
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
      payment_method_types: ['card', 'us_bank_account'],
      payment_method_collection: 'always',
      subscription_data: {
        metadata: { organization_id: org.id, role: profile.role },
      },
      success_url: `${baseUrl}/dashboard/billing?success=1`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=1`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    void logError(ErrorCategory.STRIPE, 'Stripe checkout session creation failed', {
      err: err instanceof Error ? err.message : String(err), orgId: org.id,
    }, { route: '/api/stripe/checkout', user_id: user.id, severity: ErrorSeverity.HIGH })
    return NextResponse.json({ error: 'Checkout session creation failed. Please try again.' }, { status: 500 })
  }
}
