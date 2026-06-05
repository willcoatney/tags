import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin.from('contractor_profiles').select('*').eq('user_id', user.id).single()

  // Fetch ratings for this contractor
  const { data: ratingsRaw } = await admin.from('ratings')
    .select('rating, comment, created_at, project_id, projects(title)')
    .eq('contractor_user_id', user.id)
    .order('created_at', { ascending: false })

  const ratings = (ratingsRaw || []).map((r: { rating: number; comment: string | null; created_at: string; project_id: string; projects: { title: string }[] | { title: string } | null }) => {
    const proj = Array.isArray(r.projects) ? r.projects[0] : r.projects
    return {
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      project_title: proj?.title || null,
    }
  })

  const avgRating = ratings.length
    ? Math.round((ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length) * 10) / 10
    : null

  return NextResponse.json({ ...(data || {}), ratings, avgRating, ratingCount: ratings.length })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await req.json()

  const { error } = await admin.from('contractor_profiles')
    .update(body)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
