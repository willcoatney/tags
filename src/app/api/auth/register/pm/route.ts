import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const { fullName, email, phone, password, companyName, portfolioToken } = await req.json()
  const admin = createAdminClient()

  // 1. Create org
  const { data: org, error: orgErr } = await admin.from('organizations').insert({
    name: companyName,
    type: 'pm',
  }).select().single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  // 2. Create auth user
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  // 3. Create profile
  const { error: profileErr } = await admin.from('user_profiles').insert({
    id: authData.user.id,
    organization_id: org.id,
    role: 'pm',
    full_name: fullName,
    phone,
    email,
  })

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

  // 4. Optionally connect to portfolio via invite token
  if (portfolioToken) {
    const { data: invite } = await admin
      .from('portfolio_invites')
      .select('id, portfolio_id')
      .eq('token', portfolioToken)
      .is('used_by_org_id', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invite) {
      await admin.from('portfolio_organizations').insert({
        portfolio_id: invite.portfolio_id,
        organization_id: org.id,
      })
      await admin
        .from('portfolio_invites')
        .update({ used_by_org_id: org.id })
        .eq('id', invite.id)
    }
  }

  if (phone) await sendSMS(phone, `Welcome to TAGS! You're all set. Post your first project at https://www.tagyourproject.com`)

  return NextResponse.json({ success: true })
}
