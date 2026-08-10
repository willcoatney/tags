import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

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

  // M-04: Check property insert error
  if (address) {
    const { error: propErr } = await admin.from('properties').insert({
      organization_id: org.id,
      created_by: authData.user.id,
      name: 'My Home',
      address,
      city: '',
      state: '',
      zip: '',
    })
    if (propErr) {
      console.error('[homeowner/register] Address property insert failed:', propErr)
      void logError(ErrorCategory.DB, 'Homeowner address property insert failed during registration', {
        propErr: propErr.message,
      }, { route: '/api/auth/register/homeowner', severity: ErrorSeverity.MEDIUM })
      // Non-fatal — user account is created, address can be set later
    }
  }

  return NextResponse.json({ success: true })
}
