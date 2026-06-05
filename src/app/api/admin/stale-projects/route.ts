import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { getBaseUrl } from '@/lib/url'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-tags-secret')
  if (secret !== process.env.TAGS_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()
  const windowEnd = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()

  const { data: projects } = await admin.from('projects')
    .select('id, title, organization_id, created_at')
    .eq('status', 'open')
    .gte('created_at', windowStart)
    .lte('created_at', windowEnd)

  if (!projects?.length) return NextResponse.json({ alerted: 0 })

  let alerted = 0
  const baseUrl = getBaseUrl()

  for (const project of projects) {
    const { count } = await admin.from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project.id)

    if ((count ?? 0) > 0) continue

    const { data: pms } = await admin.from('user_profiles')
      .select('phone')
      .eq('organization_id', project.organization_id)
      .eq('role', 'pm')

    const projectUrl = `${baseUrl}/dashboard/pm/projects/${project.id}`

    for (const pm of (pms || [])) {
      if (pm.phone) {
        await sendSMS(pm.phone, `Your project "${project.title}" has been live for 48 hours with no bids yet. TAGS is actively expanding contractor coverage in your area. View project: ${projectUrl}`)
        alerted++
      }
    }
  }

  return NextResponse.json({ alerted })
}
