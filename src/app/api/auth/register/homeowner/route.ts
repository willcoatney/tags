import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { fullName, email, phone, password, address } = await req.json()
  const admin = createAdminClient()

  // 1. Create org
  const { data: org, error: orgErr } = await admin.from('organizations').insert({
    name: `${fullName}'s Home`,
    type: 'homeowner',
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
    role: 'homeowner',
    full_name: fullName,
    phone,
    email,
  })

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

  // Store address as a property for this homeowner
  if (address) {
    await admin.from('properties').insert({
      organization_id: org.id,
      created_by: authData.user.id,
      name: 'My Home',
      address,
      city: '',
      state: '',
      zip: '',
    })
  }

  return NextResponse.json({ success: true })
}
