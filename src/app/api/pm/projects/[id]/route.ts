import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // L-07: Whitelist only allowed fields — prevent PM from overwriting status, created_by, organization_id, etc.
  const body = await req.json()
  const { title, description, budget_min, budget_max, unit_number } = body
  const allowedUpdate: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (title !== undefined) allowedUpdate.title = title
  if (description !== undefined) allowedUpdate.description = description
  if (budget_min !== undefined) allowedUpdate.budget_min = budget_min
  if (budget_max !== undefined) allowedUpdate.budget_max = budget_max
  if (unit_number !== undefined) allowedUpdate.unit_number = unit_number

  // Verify the project belongs to the user's org before updating
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { error } = await admin.from('projects')
    .update(allowedUpdate)
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
