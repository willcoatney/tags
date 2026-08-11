import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
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

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return NextResponse.json({ error: 'No profile found' }, { status: 404 })
  }

  const { data: org } = await admin
    .from('organizations')
    .select('subscription_status, stripe_customer_id')
    .eq('id', profile.organization_id)
    .single()

  return NextResponse.json({
    subscription_status: org?.subscription_status ?? null,
    stripe_customer_id: org?.stripe_customer_id ?? null,
    role: profile.role,
  })
}
