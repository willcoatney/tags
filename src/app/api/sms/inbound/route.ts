import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

function twiml(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

function normalizePhone(phone: string): string {
  // Strip non-digits
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  // Already in E.164-ish form
  if (phone.startsWith('+')) return phone
  return `+${digits}`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const admin = createAdminClient()

  // Parse form-encoded body from Twilio
  let from = ''
  let body = ''
  try {
    const formData = await req.formData()
    from = (formData.get('From') as string) || ''
    body = (formData.get('Body') as string) || ''
  } catch {
    // Fallback: try reading as text and parsing manually
    const text = await req.text()
    const params = new URLSearchParams(text)
    from = params.get('From') || ''
    body = params.get('Body') || ''
  }

  if (!from) {
    return twiml('Unable to process your message.')
  }

  const normalizedFrom = normalizePhone(from)

  // Look up sender in user_profiles by phone
  const { data: senderProfile } = await admin
    .from('user_profiles')
    .select('id, full_name, role, phone')
    .eq('phone', normalizedFrom)
    .maybeSingle()

  if (!senderProfile) {
    return twiml("Sorry, we couldn't find your account. Please contact your property manager.")
  }

  const senderId = senderProfile.id
  const senderRole = senderProfile.role

  // Find active projects for this user
  let projects: Array<{
    id: string
    title: string
    created_by: string
    status: string
    bids?: Array<{ contractor_id: string; status: string }>
  }> = []

  if (senderRole === 'pm') {
    // PM: projects they created
    const { data } = await admin
      .from('projects')
      .select('id, title, created_by, status, bids(contractor_id, status)')
      .eq('created_by', senderId)
      .in('status', ['open', 'awarded'])
      .order('updated_at', { ascending: false })

    projects = (data as typeof projects) || []
  } else {
    // Contractor: projects they have a bid on
    const { data: bids } = await admin
      .from('bids')
      .select('project_id, status, projects(id, title, created_by, status, bids(contractor_id, status))')
      .eq('contractor_id', senderId)

    if (bids) {
      const seen = new Set<string>()
      for (const bid of bids) {
        const proj = bid.projects as unknown as typeof projects[0] | null
        if (proj && !seen.has(proj.id) && ['open', 'awarded'].includes(proj.status)) {
          seen.add(proj.id)
          projects.push(proj)
        }
      }
      // Sort by most recently updated (we don't have updated_at here, order as-is)
    }
  }

  if (projects.length === 0) {
    return twiml("You don't have any active projects right now.")
  }

  // If multiple projects, we need context. Simple approach: pick the first (most recent) one.
  // For a cleaner UX, we'd implement a selection flow — but that requires session state.
  // For now: if 1 project, proceed. If multiple, list them and ask to contact via app.
  // (A full selection flow requires persistent state outside scope here — we'll note the limitation)
  if (projects.length > 1) {
    const list = projects
      .slice(0, 5)
      .map((p, i) => `${i + 1}. ${p.title}`)
      .join('\n')
    return twiml(
      `You have ${projects.length} active projects. Please use the TAGS app to message on a specific project, or contact your property manager.\n\n${list}`
    )
  }

  const project = projects[0]

  // Determine the other party
  let otherPartyId: string | null = null

  if (senderRole === 'pm') {
    // Find awarded contractor
    const awardedBid = (project.bids || []).find(b => b.status === 'awarded')
    otherPartyId = awardedBid?.contractor_id || null
  } else {
    // Contractor → PM
    otherPartyId = project.created_by
  }

  if (!otherPartyId) {
    return twiml('No awarded contractor found for this project yet. Your message could not be delivered.')
  }

  // Insert message into project_messages
  await admin.from('project_messages').insert({
    project_id: project.id,
    sender_id: senderId,
    message: body.trim(),
    channel: 'sms',
  })

  // Look up the other party's phone and notify them
  const { data: otherProfile } = await admin
    .from('user_profiles')
    .select('full_name, phone')
    .eq('id', otherPartyId)
    .maybeSingle()

  if (otherProfile?.phone) {
    const senderName = senderProfile.full_name || (senderRole === 'pm' ? 'Property Manager' : 'Contractor')
    await sendSMS(
      otherProfile.phone,
      `${senderName} via TAGS (${project.title}): ${body.trim()}. Reply to this text to respond.`
    )
  }

  return twiml('Message delivered.')
}
