import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, project_type, scope_of_work, unit_number } = body

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (project_type !== undefined) updates.project_type = project_type
  if (scope_of_work !== undefined) updates.scope_of_work = scope_of_work
  if (unit_number !== undefined) updates.unit_number = unit_number

  const { error } = await admin
    .from('projects')
    .update(updates)
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: project } = await admin.from('projects')
    .select('id, title, organization_id, status')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (['completed', 'cancelled'].includes(project.status)) {
    return NextResponse.json({ error: 'Project cannot be cancelled' }, { status: 400 })
  }

  await admin.from('projects').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', params.id)

  const { data: bids } = await admin.from('bids')
    .select('contractor_user_id')
    .eq('project_id', params.id)

  for (const bid of (bids || [])) {
    const { data: cp } = await admin.from('user_profiles').select('phone').eq('id', bid.contractor_user_id).maybeSingle()
    if (cp?.phone) await sendSMS(cp.phone, `Project "${project.title}" has been cancelled. Keep an eye out for new projects on TAGS.`)
  }

  return NextResponse.json({ success: true })
}
