import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const admin = createAdminClient()

  const { data: invite } = await admin.from('contractor_invites')
    .select('*, user_profiles!invited_by(full_name), organizations!inviting_org_id(name)')
    .eq('token', params.token)
    .is('used_at', null)
    .maybeSingle()

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found or already used' }, { status: 404 })
  }

  return NextResponse.json({
    email: invite.email,
    name: invite.name,
    phone: invite.phone || null,
    inviterName: (invite.user_profiles as { full_name?: string } | null)?.full_name,
    orgName: (invite.organizations as { name?: string } | null)?.name,
    token: invite.token,
  })
}
