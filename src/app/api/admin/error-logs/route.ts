import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/admin/error-logs
// Query params:
//   page        — page number (default 1)
//   limit       — records per page (default 50, max 200)
//   category    — filter by category (stripe|sms|email|db|auth|api)
//   severity    — filter by severity (critical|high|medium|low)
//   resolved    — 'true' | 'false' | undefined (all)
//   from        — ISO date string (start of range)
//   to          — ISO date string (end of range)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') ?? '50', 10)))
  const category = searchParams.get('category')
  const severity = searchParams.get('severity')
  const resolvedParam = searchParams.get('resolved')
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const offset = (page - 1) * limit

  let query = admin
    .from('error_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category', category)
  if (severity) query = query.eq('severity', severity)
  if (resolvedParam === 'true') query = query.eq('resolved', true)
  if (resolvedParam === 'false') query = query.eq('resolved', false)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data: logs, count, error } = await query

  if (error) {
    console.error('[error-logs] GET failed:', error)
    return NextResponse.json({ error: 'Failed to fetch error logs' }, { status: 500 })
  }

  return NextResponse.json({
    logs: logs ?? [],
    total: count ?? 0,
    page,
    limit,
    pages: Math.ceil((count ?? 0) / limit),
  })
}

// PATCH /api/admin/error-logs
// Body: { ids: string[] }
// Marks the given log IDs as resolved
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 })
  }

  const { error } = await admin
    .from('error_logs')
    .update({ resolved: true })
    .in('id', ids)

  if (error) {
    console.error('[error-logs] PATCH failed:', error)
    return NextResponse.json({ error: 'Failed to mark logs as resolved' }, { status: 500 })
  }

  return NextResponse.json({ success: true, resolved: ids.length })
}
