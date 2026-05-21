import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: project } = await admin.from('projects')
    .select('*, properties(city, state, zip), project_photos(*)')
    .eq('id', params.id)
    .in('status', ['open', 'awarded', 'work_complete'])
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: existingBid } = await admin.from('bids')
    .select('id')
    .eq('project_id', params.id)
    .eq('contractor_user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ project, alreadyBid: !!existingBid, userId: user.id })
}
