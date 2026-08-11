import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST() {
  const cookieStore = await cookies()

  // SSR client — only used for getUser()
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

  // Admin client — bypasses RLS
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  const { data: org } = await admin
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', profile.organization_id)
    .single()

  if (!org?.stripe_customer_id) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
  }

  // H-04: Wrap Stripe portal session in try/catch
  try {
    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.tagyourproject.com'

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Stripe portal error:', err)
    void logError(ErrorCategory.STRIPE, 'Stripe billing portal session creation failed', {
      err: err instanceof Error ? err.message : String(err), orgId: profile.organization_id,
    }, { route: '/api/stripe/portal', user_id: user.id, severity: ErrorSeverity.HIGH })
    return NextResponse.json({ error: 'Unable to open billing portal. Please try again.' }, { status: 500 })
  }
}
