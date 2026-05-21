import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const { fullName, email, phone, password, companyName, unitCount } = await req.json()
  const admin = createAdminClient()

  // 1. Create org
  const { data: org, error: orgErr } = await admin.from('organizations').insert({
    name: companyName,
    type: 'pm',
  }).select().single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  if (unitCount) {
    await admin.from('organizations').update({ unit_count: unitCount }).eq('id', org.id)
  }

  // 2. Create auth user
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  // 3. Create profile
  await admin.from('user_profiles').insert({
    id: authData.user.id,
    organization_id: org.id,
    role: 'pm',
    full_name: fullName,
    phone,
    email,
  })

  if (phone) await sendSMS(phone, `Welcome to TAGS! You're all set. Post your first project at https://www.tagyourproject.com`)

  return NextResponse.json({ success: true })
}
