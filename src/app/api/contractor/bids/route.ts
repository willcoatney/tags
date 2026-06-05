import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'
import { sendEmail, newBidEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'contractor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: contractorProfile } = await admin.from('contractor_profiles')
    .select('company_name, approval_status')
    .eq('user_id', user.id)
    .single()

  if (!contractorProfile || contractorProfile.approval_status !== 'approved') {
    return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
  }

  const body = await req.json()
  const { project_id, amount, timeline_days, notes } = body

  const { data: project } = await admin.from('projects')
    .select('title, organization_id, status')
    .eq('id', project_id)
    .single()

  if (!project || project.status !== 'open') {
    return NextResponse.json({ error: 'Project not available' }, { status: 400 })
  }

  const { error: bidErr } = await admin.from('bids').insert({
    project_id,
    contractor_user_id: user.id,
    contractor_organization_id: profile.organization_id,
    amount,
    timeline_days,
    notes,
  })

  if (bidErr) return NextResponse.json({ error: bidErr.message }, { status: 500 })

  // Notify PM
  const { data: pmUsers } = await admin.from('user_profiles')
    .select('phone, email')
    .eq('organization_id', project.organization_id)
    .eq('role', 'pm')

  const baseUrl = getBaseUrl()
  const bidsUrl = `${baseUrl}/dashboard/pm/projects/${project_id}/bids`
  const msg = `New bid received on "${project.title}" from ${contractorProfile.company_name}. Review: ${bidsUrl}`

  for (const pm of (pmUsers || [])) {
    if (pm.phone) await sendSMS(pm.phone, msg)
    if (pm.email) {
      const { subject, html } = newBidEmail(project.title, contractorProfile.company_name, bidsUrl)
      await sendEmail(pm.email, subject, html)
    }
  }

  return NextResponse.json({ success: true })
}
