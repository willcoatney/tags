import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { projectId, contractorUserId, rating, comment } = await req.json()
  if (!projectId || !contractorUserId || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await admin.from('ratings').insert({
    project_id: projectId,
    contractor_user_id: contractorUserId,
    rated_by: user.id,
    rating,
    comment: comment || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
