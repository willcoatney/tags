import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'homeowner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { title, project_type, description } = body

  if (!title || !project_type || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Homeowners don't have a property_id — use a placeholder or allow null
  // We insert directly into projects for the homeowner's org
  const { data: project, error } = await admin
    .from('projects')
    .insert({
      organization_id: profile.organization_id,
      created_by: user.id,
      title,
      project_type,
      description,
      status: 'draft',
      job_category: null,
      property_id: null,
    })
    .select()
    .single()

  if (error) {
    console.error('homeowner/projects POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project })
}
