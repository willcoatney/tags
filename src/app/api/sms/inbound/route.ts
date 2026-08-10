import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSMS } from '@/lib/sms'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

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

  // M-07: Query directly by phone instead of fetching all users
  const { data: senderProfile, error: profileErr } = await admin
    .from('user_profiles')
    .select('id, full_name, role, phone')
    .eq('phone', normalized)
    .maybeSingle()

  if (profileErr) {
    console.error('[SMS inbound] Profile lookup error:', profileErr)
    void logError(ErrorCategory.DB, 'SMS inbound: phone lookup failed', {
      err: profileErr.message, normalizedPhone: normalized,
    }, { route: '/api/sms/inbound', severity: ErrorSeverity.MEDIUM })
    return twiml()
  }

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

  // H-10: Check message insert — failure would silently drop the inbound SMS
  const { error: insertErr } = await admin.from('project_messages').insert({
    project_id: projectId,
    sender_id: senderId,
    contractor_user_id: contractorUserId,
    message: body.trim(),
    channel: 'sms',
  })

  if (insertErr) {
    console.error('[SMS inbound] Failed to store message:', insertErr)
    void logError(ErrorCategory.DB, 'SMS inbound: failed to store message — message lost', {
      err: insertErr.message, senderId, projectId,
    }, { route: '/api/sms/inbound', severity: ErrorSeverity.HIGH })
    // Still return twiml() — Twilio can't retry at this point
    return twiml()
  }

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
        const projectLink = senderRole === 'contractor'
          ? `https://www.tagyourproject.com/dashboard/pm/projects/${projectId}`
          : `https://www.tagyourproject.com/dashboard/contractor/projects/${projectId}`
        await sendSMS(otherProfile.phone, `${senderName} via TAGS (${project?.title}): ${body.trim()}\n\nReply in the app: ${projectLink}`)
      }
    }
  } catch (e) {
    console.error('[SMS inbound] Notify error:', e)
    void logError(ErrorCategory.SMS, 'SMS inbound: failed to notify other party', {
      err: e instanceof Error ? e.message : String(e), senderId, projectId,
    }, { route: '/api/sms/inbound', severity: ErrorSeverity.MEDIUM })
  }

  return twiml()
}
