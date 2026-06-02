import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role, full_name, organizations(name)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, name } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Check for existing unused invite to this email for this org
  const { data: existing } = await admin.from('contractor_invites')
    .select('token')
    .eq('inviting_org_id', profile.organization_id)
    .eq('email', email.toLowerCase())
    .is('used_at', null)
    .maybeSingle()

  let token: string

  if (existing) {
    token = existing.token
  } else {
    const { data: invite, error } = await admin.from('contractor_invites').insert({
      invited_by: user.id,
      inviting_org_id: profile.organization_id,
      email: email.toLowerCase(),
      name: name || null,
    }).select('token').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    token = invite.token
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tagyourproject.com'
  const inviteUrl = `${baseUrl}/invite/${token}`
  const orgName = (profile.organizations as { name?: string } | null)?.name || 'your property management company'
  const inviterName = profile.full_name || 'A property manager'

  await sendEmail(
    email,
    `${inviterName} invited you to join TAGS`,
    `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #0f172a;">${inviterName} invited you to TAGS</h2>
        <p style="color: #475569;">
          ${inviterName} from <strong>${orgName}</strong> has invited you to join TAGS —
          a platform where property managers post repair projects and contractors submit bids.
        </p>
        <p style="color: #475569;">
          As an invited contractor, your account will be <strong>approved automatically</strong> — no waiting period.
        </p>
        <p>
          <a href="${inviteUrl}"
            style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Accept Invite & Create Account →
          </a>
        </p>
        <p style="color: #94a3b8; font-size: 13px;">This invite is for ${email}. If you weren't expecting this, you can ignore it.</p>
      </div>
    `
  )

  return NextResponse.json({ success: true, inviteUrl })
}
