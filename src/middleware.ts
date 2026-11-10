import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require an active subscription (PM dashboard)
const BILLING_GATED_PREFIX = '/dashboard'
// These dashboard routes are always accessible (billing management itself)
const BILLING_EXEMPT = ['/dashboard/billing']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // L-04: Handle getUser() errors — if Supabase is down or JWT is malformed,
  // treat as unauthenticated rather than crashing middleware and blocking all requests
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr) {
    console.error('[middleware] getUser error — treating as unauthenticated:', authErr.message)
  }

  const { pathname } = request.nextUrl

  // 1. Auth gate — unauthenticated users can't access dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // 2. Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname.startsWith('/register'))) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo')
    const url = request.nextUrl.clone()
    url.pathname = redirectTo && redirectTo.startsWith('/dashboard') ? redirectTo : '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // 3. Subscription gate — PMs must have an active subscription to use the dashboard
  //    Skip for: billing page (so they can subscribe/manage), non-dashboard routes, unauthenticated users
  if (
    user &&
    pathname.startsWith(BILLING_GATED_PREFIX) &&
    !BILLING_EXEMPT.some(exempt => pathname.startsWith(exempt))
  ) {
    // Only gate PM role — homeowners and admins are not subscription-gated
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'pm') {
      const { data: org } = await supabase
        .from('organizations')
        .select('subscription_status')
        .eq('id', profile.organization_id)
        .single()

      if (!org || org.subscription_status !== 'active') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/billing'
        url.searchParams.set('required', '1')
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
