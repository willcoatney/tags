import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const { companyName, fullName, email, phone, password, services, serviceZipCodes } = await req.json()
  const admin = createAdminClient()

  const { data: org, error: orgErr } = await admin.from('organizations').insert({
    name: companyName,
    type: 'contractor',
  }).select().single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  await admin.from('user_profiles').insert({
    id: authData.user.id,
    organization_id: org.id,
    role: 'contractor',
    full_name: fullName,
    phone,
    email,
  })

  await admin.from('contractor_profiles').insert({
    user_id: authData.user.id,
    organization_id: org.id,
    company_name: companyName,
    services,
    service_zip_codes: serviceZipCodes,
    approval_status: 'pending',
  })

  // Alert admin
  const { data: admins } = await admin.from('user_profiles')
    .select('phone')
    .eq('role', 'admin')

  for (const a of (admins || [])) {
    if (a.phone) await sendSMS(a.phone, `New contractor pending approval: ${companyName}. Review in TAGS admin.`)
  }

  return NextResponse.json({ success: true })
}
