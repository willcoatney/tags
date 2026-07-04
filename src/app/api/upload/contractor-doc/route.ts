import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_DOC_TYPES = ['w9', 'coi', 'license', 'insurance'] as const
type DocType = typeof VALID_DOC_TYPES[number]

const DOC_FIELD_MAP: Record<DocType, string> = {
  w9: 'w9_url',
  coi: 'insurance_url',
  license: 'license_url',
  insurance: 'insurance_url',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const docType = formData.get('docType') as DocType

  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  if (!VALID_DOC_TYPES.includes(docType)) {
    return NextResponse.json({ error: 'Invalid docType' }, { status: 400 })
  }

  // Only PDFs and images
  const allowedMime = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  if (!allowedMime.includes(file.type)) {
    return NextResponse.json({ error: 'Only PDF or image files are accepted' }, { status: 400 })
  }

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify this user has a contractor profile
  const { data: profile } = await admin.from('contractor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 })

  const ext = file.name.split('.').pop()
  const filename = `${user.id}/${docType}-${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const { error: uploadError } = await admin.storage
    .from('contractor-docs')
    .upload(filename, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Get a signed URL (private bucket — 10 year expiry for compliance docs)
  const { data: signedData } = await admin.storage
    .from('contractor-docs')
    .createSignedUrl(filename, 60 * 60 * 24 * 365 * 10)

  const url = signedData?.signedUrl || ''

  const dbField = DOC_FIELD_MAP[docType]
  const { error: updateError } = await admin.from('contractor_profiles')
    .update({ [dbField]: url })
    .eq('user_id', user.id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ url })
}
