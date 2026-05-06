import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: project, error } = await admin
    .from('projects')
    .select('*, properties(name, address, city, state)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (error || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(project)
}
