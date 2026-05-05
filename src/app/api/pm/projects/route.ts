import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { propertyId, title, projectType, description, budgetMin, budgetMax } = await req.json()

  const { data: property } = await admin.from('properties').select('*').eq('id', propertyId).single()

  const { data: project, error } = await admin.from('projects').insert({
    organization_id: profile.organization_id,
    property_id: propertyId,
    created_by: user.id,
    title,
    project_type: projectType,
    description,
    budget_min: budgetMin,
    budget_max: budgetMax,
    status: 'draft',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project, property })
}
