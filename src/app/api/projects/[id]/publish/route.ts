import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify PM owns the project
  const { data: project } = await admin.from('projects')
    .select('*, properties(*)')
    .eq('id', params.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm' || profile.organization_id !== project.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Publish project
  await admin.from('projects').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', params.id)

  // Find matching contractors: approved + matching service type
  // Use explicit FK hint to avoid ambiguity (contractor_profiles has two FKs to user_profiles)
  const { data: allContractors } = await admin.from('contractor_profiles')
    .select('*, user_profiles!contractor_profiles_user_id_fkey(*)')
    .eq('approval_status', 'approved')
    .contains('services', [project.project_type])

  const contractors = (allContractors || []).filter(c => {
    const states: string[] = c.service_states || []
    // No state restriction set, or explicitly covers the project's state
    return states.length === 0 || states.includes(project.properties?.state)
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const projectUrl = `${baseUrl}/dashboard/contractor/projects/${params.id}`
  const msg = `New ${project.project_type} project posted in ${project.properties.city}, ${project.properties.state}. View & bid: ${projectUrl}`

  for (const contractor of (contractors || [])) {
    const up = Array.isArray(contractor.user_profiles)
      ? contractor.user_profiles[0]
      : contractor.user_profiles
    if (!up) continue
    if (up.phone) {
      try { await sendSMS(up.phone, msg) } catch (e) { console.error('[publish] SMS error for', up.phone, e) }
    }
    if (up.email) {
      try { await sendEmail(up.email, `New project: ${project.title}`, `<p>${msg}</p>`) } catch (e) { console.error('[publish] Email error for', up.email, e) }
    }
  }

  return NextResponse.json({ success: true })
}
