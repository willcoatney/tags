'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SOWViewer from '@/components/SOWViewer'
import { toast } from 'sonner'
import { type ProjectType } from '@/lib/types'

interface Project {
  id: string
  title: string
  description: string
  project_type: ProjectType
  status: string
  scope_of_work: string | null
  scope_generated_at: string | null
  property_id: string
  properties: { name: string; address: string; city: string; state: string }
}

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sow, setSow] = useState('')
  const [sowPreview, setSowPreview] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [descriptionChanged, setDescriptionChanged] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const res = await fetch(`/api/projects/${params.id}/data`)
      if (!res.ok) { router.push('/dashboard/pm'); return }
      const proj = await res.json()
      setProject(proj)
      setTitle(proj.title)
      setDescription(proj.description)
      setSow(proj.scope_of_work || '')
      setLoading(false)
    }
    load()
  }, [params.id, router, supabase])

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const current = photos.length
    const allowed = files.slice(0, Math.max(0, 5 - current))
    if (allowed.length < files.length) toast.warning('Max 5 photos total')
    setPhotos(prev => [...prev, ...allowed])
    allowed.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  async function uploadNewPhotos(projectId: string): Promise<string[]> {
    if (photos.length === 0) return []
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []
    const urls: string[] = []
    for (const photo of photos) {
      const path = `${user.id}/${projectId}/${Date.now()}-${photo.name}`
      const { error } = await supabase.storage.from('project-photos').upload(path, photo)
      if (error) { toast.error(`Photo upload failed: ${photo.name}`); continue }
      const { data: pub } = supabase.storage.from('project-photos').getPublicUrl(path)
      const admin = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, storage_path: path, public_url: pub.publicUrl }),
      })
      if (admin.ok) urls.push(pub.publicUrl)
    }
    return urls
  }

  async function handleSave(andRegenerate = false) {
    if (!project) return
    setSaving(true)

    try {
      // Upload new photos first
      const newPhotoUrls = await uploadNewPhotos(project.id)

      if (andRegenerate) {
        // Save edits then regenerate SOW
        await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        })

        setRegenerating(true)
        setSow('')
        setSowPreview(true)
        let accumulated = ''

        const res = await fetch('/api/projects/generate-scope', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: project.id,
            projectType: project.project_type,
            description,
            propertyAddress: `${project.properties.name}, ${project.properties.address}, ${project.properties.city}`,
            photoUrls: newPhotoUrls,
          }),
        })

        if (!res.body) throw new Error('No stream')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setSow(accumulated)
        }
        setRegenerating(false)
        setDescriptionChanged(false)
        toast.success('SOW regenerated with your changes')
      } else {
        // Save edits + current SOW
        await fetch(`/api/projects/${project.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description, scope_of_work: sow }),
        })
        toast.success('Project updated')
        router.push(`/dashboard/pm/projects/${project.id}`)
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full" />
    </div>
  )

  if (!project) return null

  const isOpen = project.status === 'open'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Project</h1>
          <p className="text-slate-400 mt-1 text-sm">{project.properties.name} — {project.properties.address}</p>
        </div>
        <button onClick={() => router.push(`/dashboard/pm/projects/${project.id}`)}
          className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
          ← Back
        </button>
      </div>

      {isOpen && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
          style={{ background: 'oklch(0.22 0.06 75)', border: '1px solid oklch(0.35 0.08 75)', color: 'oklch(0.85 0.10 75)' }}>
          ⚠️ This project is open for bids. Editing the description and regenerating the SOW will update what contractors see. Existing bids are not affected.
        </div>
      )}

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader><CardTitle className="text-white text-base">Project Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white mt-1" />
          </div>
          <div>
            <Label className="text-slate-300">Description</Label>
            <Textarea value={description}
              onChange={e => { setDescription(e.target.value); setDescriptionChanged(e.target.value !== project.description) }}
              rows={5}
              className="bg-slate-800 border-slate-600 text-white mt-1"
              placeholder="Describe what you see, what's broken, and what needs fixing" />
            {descriptionChanged && (
              <p className="text-xs mt-1.5" style={{ color: 'oklch(0.72 0.12 75)' }}>
                ⚠️ Description changed — consider regenerating the SOW to reflect your updates.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add more photos */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader><CardTitle className="text-white text-base">Add More Photos</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg cursor-pointer text-sm font-medium transition-colors"
              style={{ border: '1px solid oklch(0.30 0.08 183)', background: 'oklch(0.18 0.06 183)', color: 'oklch(0.72 0.12 183)' }}>
              📷 Take Photo
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg cursor-pointer text-sm font-medium transition-colors"
              style={{ border: '1px solid oklch(0.27 0.025 252)', background: 'oklch(0.20 0.022 252)', color: 'oklch(0.65 0.02 252)' }}>
              🖼 Upload from Library
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
            </label>
          </div>
          {photoPreviews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photoPreviews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOW section */}
      {sow && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">Scope of Work</CardTitle>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid oklch(0.27 0.025 252)' }}>
                {['Preview', 'Edit'].map(mode => (
                  <button key={mode}
                    onClick={() => setSowPreview(mode === 'Preview')}
                    className="px-3 py-1 text-xs font-medium transition-colors"
                    style={{
                      background: (mode === 'Preview') === sowPreview ? 'oklch(0.27 0.025 252)' : 'transparent',
                      color: (mode === 'Preview') === sowPreview ? 'white' : 'oklch(0.55 0.02 252)',
                    }}>
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sowPreview ? (
              <SOWViewer text={sow} streaming={regenerating} />
            ) : (
              <Textarea value={sow} onChange={e => setSow(e.target.value)} rows={16}
                className="font-mono text-sm"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <Button variant="outline" onClick={() => router.push(`/dashboard/pm/projects/${project.id}`)}
          className="border-slate-600 text-slate-300">
          Cancel
        </Button>
        <button onClick={() => handleSave(false)} disabled={saving || regenerating}
          className="flex-1 h-11 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'white', background: 'oklch(0.20 0.022 252)' }}>
          {saving && !regenerating ? 'Saving…' : 'Save Changes'}
        </button>
        {descriptionChanged || photos.length > 0 ? (
          <button onClick={() => handleSave(true)} disabled={saving || regenerating}
            className="flex-1 h-11 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: regenerating ? 'oklch(0.45 0.1 183)' : 'oklch(0.57 0.135 183)' }}>
            {regenerating ? '⚙️ Regenerating SOW…' : '✨ Save & Regenerate SOW'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
