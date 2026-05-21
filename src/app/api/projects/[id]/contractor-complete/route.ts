import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role, full_name').eq('id', user.id).single()
  if (!profile || profile.role !== 'contractor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: bid } = await admin.from('bids')
    .select('id')
    .eq('project_id', params.id)
    .eq('contractor_user_id', user.id)
    .eq('status', 'awarded')
    .maybeSingle()

  if (!bid) return NextResponse.json({ error: 'No awarded bid found' }, { status: 403 })

  const { data: project } = await admin.from('projects')
    .select('id, title, status, created_by, organization_id')
    .eq('id', params.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.status !== 'awarded') return NextResponse.json({ error: 'Project is not in awarded status' }, { status: 400 })

  await admin.from('projects').update({ status: 'work_complete', updated_at: new Date().toISOString() }).eq('id', params.id)

  const { data: pmUsers } = await admin.from('user_profiles')
    .select('phone')
    .eq('organization_id', project.organization_id)
    .eq('role', 'pm')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const projectUrl = `${baseUrl}/dashboard/pm/projects/${params.id}`
  const contractorName = profile.full_name || 'Your contractor'

  for (const pm of (pmUsers || [])) {
    if (pm.phone) await sendSMS(pm.phone, `${contractorName} has marked work complete on "${project.title}". Please log in to confirm: ${projectUrl}`)
  }

  return NextResponse.json({ success: true })
}
