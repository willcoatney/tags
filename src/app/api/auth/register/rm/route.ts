import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { portfolioName, fullName, email, phone, password } = await req.json()
  const admin = createAdminClient()

  // 1. Create organization (type pm — the AM's org umbrella)
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .insert({ name: portfolioName, type: 'pm' })
    .select()
    .single()

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 500 })

  // 2. Create auth user
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  // 3. Create user profile
  const { error: profileErr } = await admin.from('user_profiles').insert({
    id: authData.user.id,
    organization_id: org.id,
    role: 'asset_manager',
    full_name: fullName,
    phone,
    email,
  })

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 })

  // 4. Create portfolio
  const { error: portfolioErr } = await admin.from('portfolios').insert({
    name: portfolioName,
    owner_id: authData.user.id,
  })

  if (portfolioErr) return NextResponse.json({ error: portfolioErr.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
