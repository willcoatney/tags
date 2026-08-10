import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

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

  const { propertyId, title, jobCategory, projectType, description, unitNumber, budgetMin, budgetMax } = await req.json()

  // H-08: Verify property belongs to PM's organization — prevent cross-org property access
  const { data: property, error: propErr } = await admin.from('properties')
    .select('*')
    .eq('id', propertyId)
    .eq('organization_id', profile.organization_id)
    .single()

  if (propErr || !property) {
    void logError(ErrorCategory.AUTH, 'PM attempted to create project with property not owned by their org', {
      propertyId, orgId: profile.organization_id,
    }, { route: '/api/pm/projects', user_id: user.id, severity: ErrorSeverity.HIGH })
    return NextResponse.json({ error: 'Property not found or not owned by your organization' }, { status: 404 })
  }

  const { data: project, error } = await admin.from('projects').insert({
    organization_id: profile.organization_id,
    property_id: propertyId,
    created_by: user.id,
    title,
    job_category: jobCategory || null,
    project_type: projectType,
    description,
    unit_number: unitNumber || null,
    budget_min: budgetMin,
    budget_max: budgetMax,
    status: 'draft',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project, property })
}
