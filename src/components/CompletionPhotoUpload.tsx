'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface UploadedPhoto {
  publicUrl: string
  storagePath: string
}

interface Props {
  projectId: string
}

export default function CompletionPhotoUpload({ projectId }: Props) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    const uploaded: UploadedPhoto[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`)
        continue
      }
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('photoType', 'completion')

      const res = await fetch('/api/upload/project-photo', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        uploaded.push({ publicUrl: data.publicUrl, storagePath: data.storagePath })
        toast.success(`${file.name} uploaded`)
      } else {
        const err = await res.json()
        toast.error(`Failed to upload ${file.name}: ${err.error}`)
      }
    }

    setPhotos(p => [...p, ...uploaded])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8 cursor-pointer transition-colors"
        style={{
          borderColor: uploading ? 'oklch(0.40 0.015 252)' : 'oklch(0.30 0.025 252)',
          background: uploading ? 'oklch(0.16 0.022 252)' : 'oklch(0.15 0.020 252)',
        }}
      >
        <div className="text-3xl mb-2">📸</div>
        <p className="text-sm font-semibold text-white">
          {uploading ? 'Uploading…' : 'Upload Completion Photos'}
        </p>
        <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.02 252)' }}>
          Click or drag & drop · JPG, PNG, HEIC · Max 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {/* Uploaded photos grid */}
      {photos.length > 0 && (
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'oklch(0.50 0.02 252)' }}>
            Uploaded ({photos.length})
          </p>
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={photo.publicUrl}
                alt={`Completion photo ${i + 1}`}
                className="w-28 h-28 object-cover rounded-lg"
                style={{ border: '2px solid oklch(0.30 0.025 252)' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
