'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

export default function HomeownerNewProjectPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState<ProjectType | ''>('')
  const [description, setDescription] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setPhotos(files)
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { toast.error('Enter a project title'); return }
    if (!projectType) { toast.error('Select a project type'); return }
    if (!description.trim()) { toast.error('Describe your repair'); return }

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Get user profile to find organization_id
      const profileRes = await fetch('/api/homeowner/profile')
      let orgId: string | null = null
      if (profileRes.ok) {
        const p = await profileRes.json()
        orgId = p.organization_id
      }

      // Create the project
      const createRes = await fetch('/api/homeowner/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          project_type: projectType,
          description: description.trim(),
        }),
      })

      if (!createRes.ok) {
        const data = await createRes.json().catch(() => ({}))
        toast.error(data.error || 'Failed to create project')
        setSubmitting(false)
        return
      }

      const { project } = await createRes.json()

      // Upload photos if any
      for (const photo of photos) {
        const fd = new FormData()
        fd.append('file', photo)
        fd.append('projectId', project.id)
        await fetch('/api/upload/project-photo', { method: 'POST', body: fd })
      }

      // Redirect to Stripe checkout for $20
      const checkoutRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'homeowner_sow',
          projectId: project.id,
          orgId,
        }),
      })

      if (!checkoutRes.ok) {
        toast.error('Failed to start payment. Please try again.')
        setSubmitting(false)
        return
      }

      const { url } = await checkoutRes.json()
      if (url) {
        window.location.href = url
      } else {
        toast.error('No checkout URL returned')
        setSubmitting(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Generate a Scope of Work</h1>
        <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Describe your repair, upload photos, and get a contractor-ready SOW for $20.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader><CardTitle className="text-white">Your Repair</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-slate-300">Project Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Leaking bathroom faucet"
                required
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">Type of Repair</Label>
              <Select onValueChange={val => setProjectType(val as ProjectType)} value={projectType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select repair type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {Object.entries(PROJECT_TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="text-white">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-300">Describe the issue</Label>
              <p className="text-xs mt-0.5 mb-1.5" style={{ color: 'oklch(0.50 0.02 252)' }}>
                What do you see? What&apos;s broken? What needs fixing? Plain language is fine.
              </p>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="e.g. The bathroom faucet has been dripping non-stop for a week. The handle is loose and water pools under the sink."
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300 block mb-1.5">Photos <span className="text-slate-500">up to 5, optional but recommended</span></Label>
              <div className="flex gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-150"
                  style={{ border: '1px solid oklch(0.30 0.08 183)', background: 'oklch(0.18 0.06 183)', color: 'oklch(0.72 0.12 183)' }}>
                  📷 Take Photo
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
                </label>
                <label className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg cursor-pointer text-sm font-medium transition-colors duration-150"
                  style={{ border: '1px solid oklch(0.27 0.025 252)', background: 'oklch(0.20 0.022 252)', color: 'oklch(0.65 0.02 252)' }}>
                  🖼 Upload from Library
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                </label>
              </div>
              {photoPreviews.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {photoPreviews.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600" />
                  ))}
                </div>
              )}
            </div>

            {/* Price callout */}
            <div className="rounded-xl p-4" style={{ background: 'oklch(0.18 0.06 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Scope of Work — one-time</p>
                  <p className="text-xs mt-0.5" style={{ color: 'oklch(0.72 0.10 183)' }}>
                    You&apos;ll be redirected to pay, then your SOW is generated.
                  </p>
                </div>
                <div className="text-2xl font-black text-white">$20</div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base font-semibold bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? 'Creating project…' : 'Continue to Payment →'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
