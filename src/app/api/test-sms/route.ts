import { NextRequest, NextResponse } from 'next/server'
import { sendSMS } from '@/lib/sms'

// ONE-TIME TEST ENDPOINT — remove after confirming SMS works
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const to = searchParams.get('to')

  if (secret !== process.env.TEST_SMS_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!to) return NextResponse.json({ error: 'Missing `to` param' }, { status: 400 })

  try {
    await sendSMS(to, 'TAGS test SMS ✓ — notifications are live.')
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
