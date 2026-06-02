import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const serviceType = req.nextUrl.searchParams.get('service')

  let query = admin.from('contractor_profiles')
    .select('id, company_name, services, service_states, user_id, user_profiles!contractor_profiles_user_id_fkey(full_name, email)')
    .eq('approval_status', 'approved')

  if (serviceType) {
    query = query.contains('services', [serviceType])
  }

  const { data: contractors } = await query.order('created_at', { ascending: false })

  // Get ratings for each contractor
  const contractorIds = (contractors || []).map((c: { user_id: string }) => c.user_id)
  const { data: ratings } = contractorIds.length > 0
    ? await admin.from('ratings').select('contractor_user_id, rating').in('contractor_user_id', contractorIds)
    : { data: [] }

  const ratingMap: Record<string, { avg: number; count: number }> = {}
  for (const r of (ratings || []) as { contractor_user_id: string; rating: number }[]) {
    if (!ratingMap[r.contractor_user_id]) ratingMap[r.contractor_user_id] = { avg: 0, count: 0 }
    ratingMap[r.contractor_user_id].count++
    ratingMap[r.contractor_user_id].avg += r.rating
  }
  for (const id of Object.keys(ratingMap)) {
    ratingMap[id].avg = Math.round((ratingMap[id].avg / ratingMap[id].count) * 10) / 10
  }

  const result = (contractors || []).map((c: {
    id: string
    user_id: string
    company_name: string
    services: string[]
    service_states: string[]
  }) => ({
    id: c.id,
    userId: c.user_id,
    companyName: c.company_name,
    services: c.services,
    serviceStates: c.service_states,
    rating: ratingMap[c.user_id] || null,
  })).sort((a: { rating: { avg: number } | null }, b: { rating: { avg: number } | null }) =>
    (b.rating?.avg ?? 0) - (a.rating?.avg ?? 0)
  )

  return NextResponse.json(result)
}
