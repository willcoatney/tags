import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'

function twiml(message?: string): NextResponse {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`
  return new NextResponse(xml, { status: 200, headers: { 'Content-Type': 'text/xml' } })
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return digits
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1)
  return digits
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const admin = createAdminClient()

  let from = ''
  let body = ''
  try {
    const formData = await req.formData()
    from = (formData.get('From') as string) || ''
    body = (formData.get('Body') as string) || ''
  } catch {
    const text = await req.text()
    const params = new URLSearchParams(text)
    from = params.get('From') || ''
    body = params.get('Body') || ''
  }

  if (!from || !body.trim()) return twiml()

  const normalized = normalizePhone(from)

  // Look up sender by phone — try stored number in multiple formats
  const { data: allProfiles } = await admin
    .from('user_profiles')
    .select('id, full_name, role, phone')

  const senderProfile = (allProfiles || []).find(p => {
    if (!p.phone) return false
    return normalizePhone(p.phone) === normalized
  }) ?? null

  if (!senderProfile) {
    console.warn('[SMS inbound] Unknown sender:', from)
    return twiml()
  }

  const senderId = senderProfile.id
  const senderRole = senderProfile.role

  // Route to the most recent active thread for this user
  let projectId: string | null = null
  let contractorUserId: string | null = null

  if (senderRole === 'contractor') {
    // Most recent thread they've been part of
    const { data: recentMsg } = await admin
      .from('project_messages')
      .select('project_id, contractor_user_id')
      .eq('contractor_user_id', senderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentMsg) {
      projectId = recentMsg.project_id
      contractorUserId = recentMsg.contractor_user_id
    } else {
      // No messages yet — fall back to most recent bid
      const { data: recentBid } = await admin
        .from('bids')
        .select('project_id, contractor_user_id')
        .eq('contractor_user_id', senderId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (recentBid) {
        projectId = recentBid.project_id
        contractorUserId = senderId
      }
    }
  } else if (senderRole === 'pm') {
    // Most recent thread they sent a message in
    const { data: recentMsg } = await admin
      .from('project_messages')
      .select('project_id, contractor_user_id')
      .eq('sender_id', senderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentMsg) {
      projectId = recentMsg.project_id
      contractorUserId = recentMsg.contractor_user_id
    }
  }

  if (!projectId || !contractorUserId) {
    console.warn('[SMS inbound] Could not resolve thread for sender:', senderId)
    return twiml()
  }

  // Store the inbound message in the correct thread
  await admin.from('project_messages').insert({
    project_id: projectId,
    sender_id: senderId,
    contractor_user_id: contractorUserId,
    message: body.trim(),
    channel: 'sms',
  })

  // Notify the other party via SMS
  try {
    const { data: project } = await admin
      .from('projects')
      .select('title, created_by')
      .eq('id', projectId)
      .maybeSingle()

    const otherPartyId = senderRole === 'pm' ? contractorUserId : project?.created_by
    if (otherPartyId) {
      const { data: otherProfile } = await admin
        .from('user_profiles')
        .select('phone')
        .eq('id', otherPartyId)
        .maybeSingle()

      if (otherProfile?.phone) {
        const senderName = senderProfile.full_name || (senderRole === 'pm' ? 'Property Manager' : 'Contractor')
        await sendSMS(otherProfile.phone, `${senderName} via TAGS (${project?.title}): ${body.trim()}`)
      }
    }
  } catch (e) {
    console.error('[SMS inbound] Notify error:', e)
  }

  return twiml()
}
