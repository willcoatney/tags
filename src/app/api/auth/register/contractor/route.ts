import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function POST(req: NextRequest) {
  const { companyName, fullName, email, phone, password, services, serviceStates, inviteToken } = await req.json()
  const admin = createAdminClient()

  // Validate invite token if provided
  let autoApprove = false
  let inviteId: string | null = null
  if (inviteToken) {
    const { data: invite } = await admin.from('contractor_invites')
      .select('id, email')
      .eq('token', inviteToken)
      .is('used_at', null)
      .maybeSingle()
    if (invite && invite.email === email.toLowerCase()) {
      autoApprove = true
      inviteId = invite.id
    }
  }

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
    service_states: serviceStates,
    approval_status: autoApprove ? 'approved' : 'pending',
  })

  if (autoApprove) {
    // Notify contractor of all currently open projects matching their services
    if (phone) {
      const { data: openProjects } = await admin.from('projects')
        .select('id, title, project_type, properties(city, state)')
        .eq('status', 'open')

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tagyourproject.com'
      const matching = (openProjects || []).filter((p: { project_type: string }) => services.includes(p.project_type))
      for (const project of matching) {
        const prop = Array.isArray(project.properties) ? project.properties[0] : project.properties
        const loc = prop ? `${prop.city}, ${prop.state}` : 'your area'
        await sendSMS(phone, `Welcome to TAGS! New project available: "${project.title}" in ${loc}. View & bid: ${baseUrl}/dashboard/contractor/projects/${project.id}`)
      }
      if (matching.length === 0) {
        await sendSMS(phone, `Welcome to TAGS! Your account is approved. Log in to start bidding on projects: ${baseUrl}/dashboard/contractor`)
      }
    }
  } else {
    if (phone) await sendSMS(phone, `Thanks for applying to TAGS! Your application is under review. We'll text you within 24 hours once approved.`)
  }

  if (inviteId) {
    // Mark invite as used
    await admin.from('contractor_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', inviteId)
  } else {
    // Alert admin only for non-invited registrations
    const { data: admins } = await admin.from('user_profiles')
      .select('phone')
      .eq('role', 'admin')
    for (const a of (admins || [])) {
      if (a.phone) await sendSMS(a.phone, `New contractor pending approval: ${companyName}. Review in TAGS admin.`)
    }
  }

  return NextResponse.json({ success: true })
}
