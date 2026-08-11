import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const plan: 'monthly' | 'yearly' = body.plan === 'yearly' ? 'yearly' : 'monthly'
  const cookieStore = await cookies()

  // SSR client — only used for getUser() (reads auth from cookie)
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

  // Admin client — bypasses RLS for all DB queries
  const admin = createAdminClient()

  // Get user profile to determine role and organization
  const { data: profile, error: profileError } = await admin
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

  // Fetch org
  const { data: orgBase, error: orgError } = await admin
    .from('organizations')
    .select('id, name, stripe_customer_id')
    .eq('id', profile.organization_id)
    .single()

  if (orgError || !orgBase) {
    console.error('Checkout: organizations lookup failed', orgError)
    return NextResponse.json({ error: 'Organization record not found. Please contact support.' }, { status: 404 })
  }

  const org = orgBase

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

      const { error: custErr } = await admin
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

    // Route to correct Stripe price based on role + plan interval
    let priceId: string
    if (isContractor) {
      priceId = plan === 'yearly'
        ? process.env.STRIPE_CONTRACTOR_PRICE_ID!          // $100/year
        : process.env.STRIPE_CONTRACTOR_MONTHLY_PRICE_ID!  // $10/month
    } else {
      priceId = plan === 'yearly'
        ? process.env.STRIPE_PM_ANNUAL_PRICE_ID!           // $500/year
        : process.env.STRIPE_PM_PRICE_ID!                  // $50/month
    }

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
