import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logError, ErrorCategory, ErrorSeverity } from '@/lib/error-logger'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const projectId = formData.get('projectId') as string
  const photoType = (formData.get('photoType') as string) || 'pre_work'

  if (!file || !projectId) {
    return NextResponse.json({ error: 'Missing file or projectId' }, { status: 400 })
  }

  const validTypes = ['pre_work', 'completion']
  if (!validTypes.includes(photoType)) {
    return NextResponse.json({ error: 'Invalid photoType' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storagePath = `projects/${projectId}/${photoType}/${filename}`

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from('project-photos')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = admin.storage
    .from('project-photos')
    .getPublicUrl(storagePath)

  // C-01: Check insert error — on failure, roll back the orphaned storage file
  const { error: insertError } = await admin.from('project_photos').insert({
    project_id: projectId,
    storage_path: storagePath,
    public_url: publicUrl,
    uploaded_by: user.id,
    photo_type: photoType,
  })

  if (insertError) {
    // Roll back: delete the orphaned file from storage
    await admin.storage.from('project-photos').remove([storagePath])
    void logError(ErrorCategory.DB, 'project_photos insert failed — storage file rolled back', {
      insertError: insertError.message, projectId, storagePath,
    }, { route: '/api/upload/project-photo', user_id: user.id, severity: ErrorSeverity.CRITICAL })
    return NextResponse.json({ error: 'Failed to record photo: ' + insertError.message }, { status: 500 })
  }

  return NextResponse.json({ publicUrl, storagePath })
}
