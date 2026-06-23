import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

  await admin.from('project_photos').insert({
    project_id: projectId,
    storage_path: storagePath,
    public_url: publicUrl,
    uploaded_by: user.id,
    photo_type: photoType,
  })

  return NextResponse.json({ publicUrl, storagePath })
}
