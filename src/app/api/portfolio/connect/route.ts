import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify user is a PM
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm') {
    return NextResponse.json({ error: 'Only property managers can connect to portfolios' }, { status: 403 })
  }

  // Validate invite
  const { data: invite } = await admin
    .from('portfolio_invites')
    .select('id, portfolio_id')
    .eq('token', token)
    .is('used_by_org_id', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ error: 'Invalid or expired invite token' }, { status: 400 })

  // Insert portfolio_organizations
  const { error: joinErr } = await admin
    .from('portfolio_organizations')
    .insert({
      portfolio_id: invite.portfolio_id,
      organization_id: profile.organization_id,
    })

  if (joinErr && !joinErr.message.includes('unique')) {
    return NextResponse.json({ error: joinErr.message }, { status: 500 })
  }

  // Mark invite as used
  await admin
    .from('portfolio_invites')
    .update({ used_by_org_id: profile.organization_id })
    .eq('id', invite.id)

  return NextResponse.json({ success: true })
}
