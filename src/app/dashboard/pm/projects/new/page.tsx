'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, type ProjectType, type Property } from '@/lib/types'

type Step = 1 | 2 | 3

export default function NewProjectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<Step>(1)
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [addingProperty, setAddingProperty] = useState(false)
  const [newProp, setNewProp] = useState({ name: '', address: '', city: '', state: '', zip: '' })
  const [projectForm, setProjectForm] = useState({
    title: '', projectType: '' as ProjectType, description: '',
    budgetMin: '', budgetMax: '',
  })
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [sow, setSow] = useState('')
  const [generatingSow, setGeneratingSow] = useState(false)
  const [sowFailed, setSowFailed] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [projectTypeForRetry, setProjectTypeForRetry] = useState('')
  const [descriptionForRetry, setDescriptionForRetry] = useState('')
  const [propertyAddressForRetry, setPropertyAddressForRetry] = useState('')
  const [photoUrlsForRetry, setPhotoUrlsForRetry] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    loadProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadProperties() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/pm/properties')
    if (res.ok) setProperties(await res.json())
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5)
    setPhotos(files)
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPropertyId && !addingProperty) {
      toast.error('Select or add a property')
      return
    }

    if (addingProperty) {
      const res = await fetch('/api/pm/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProp),
      })
      if (!res.ok) { toast.error('Failed to add property'); return }
      const prop = await res.json()
      setSelectedPropertyId(prop.id)
      setProperties(prev => [...prev, prop])
      setAddingProperty(false)
    }
    setStep(2)
  }

  async function handleStep2Submit(e: React.FormEvent) {
    e.preventDefault()
    if (!projectForm.projectType) { toast.error('Select a project type'); return }
    setStep(3)

    // Create draft project
    const createRes = await fetch('/api/pm/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: selectedPropertyId,
        title: projectForm.title,
        projectType: projectForm.projectType,
        description: projectForm.description,
        budgetMin: projectForm.budgetMin ? parseFloat(projectForm.budgetMin) : null,
        budgetMax: projectForm.budgetMax ? parseFloat(projectForm.budgetMax) : null,
      }),
    })

    if (!createRes.ok) { toast.error('Failed to create project'); return }
    const { project, property } = await createRes.json()
    setProjectId(project.id)

    // Upload photos
    const photoUrls: string[] = []
    for (const photo of photos) {
      const fd = new FormData()
      fd.append('file', photo)
      fd.append('projectId', project.id)
      const uploadRes = await fetch('/api/upload/project-photo', { method: 'POST', body: fd })
      if (uploadRes.ok) {
        const { publicUrl } = await uploadRes.json()
        photoUrls.push(publicUrl)
      }
    }

    // Save retry params
    const propAddr = `${property.address}, ${property.city}, ${property.state}`
    setProjectTypeForRetry(projectForm.projectType)
    setDescriptionForRetry(projectForm.description)
    setPropertyAddressForRetry(propAddr)
    setPhotoUrlsForRetry(photoUrls)

    // Generate SOW
    await generateSow(project.id, projectForm.projectType, projectForm.description, propAddr, photoUrls)
  }

  async function generateSow(pid: string, pType: string, desc: string, propAddr: string, urls: string[]) {
    setGeneratingSow(true)
    setSowFailed(false)
    setSow('')

    try {
      const sowRes = await fetch('/api/projects/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: pid,
          projectType: pType,
          description: desc,
          propertyAddress: propAddr,
          photoUrls: urls,
        }),
      })

      if (!sowRes.ok || !sowRes.body) {
        const data = await sowRes.json().catch(() => ({}))
        toast.error(`SOW generation failed: ${data.error || 'Unknown error'}`)
        setSowFailed(true)
        setGeneratingSow(false)
        return
      }

      const reader = sowRes.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulated += chunk

        if (accumulated.includes('__SOW_ERROR__:')) {
          const errMsg = accumulated.split('__SOW_ERROR__:')[1]?.trim() || 'Unknown error'
          toast.error(`SOW generation failed: ${errMsg}`)
          setSowFailed(true)
          setSow('')
          setGeneratingSow(false)
          return
        }

        setSow(accumulated)
      }

      if (!accumulated.trim()) {
        toast.error('SOW generation returned an empty response')
        setSowFailed(true)
      }
    } catch {
      toast.error('SOW generation failed: network error')
      setSowFailed(true)
    }

    setGeneratingSow(false)
  }

  async function retrySow() {
    if (!projectId) return
    await generateSow(projectId, projectTypeForRetry, descriptionForRetry, propertyAddressForRetry, photoUrlsForRetry)
  }

  async function handlePublish() {
    if (!projectId) return
    setPublishing(true)

    // Save any edits to SOW
    await fetch(`/api/pm/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope_of_work: sow }),
    })

    const res = await fetch(`/api/projects/${projectId}/publish`, { method: 'POST' })
    if (res.ok) {
      toast.success('Project posted! Contractors are being notified.')
      router.push('/dashboard/pm')
    } else {
      toast.error('Failed to publish project')
      setPublishing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex items-center gap-2 ${s < step ? 'text-teal-400' : s === step ? 'text-white' : 'text-slate-500'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold border-2 ${s < step ? 'bg-teal-600 border-teal-600' : s === step ? 'border-teal-400' : 'border-slate-600'}`}>
              {s < step ? '✓' : s}
            </div>
            <span className="text-sm hidden md:block">{['Property', 'Details', 'Review SOW'][s - 1]}</span>
            {s < 3 && <div className="w-8 h-px bg-slate-600 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white">Step 1 — Select Property</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {properties.length > 0 && !addingProperty && (
                <div>
                  <Label className="text-slate-300">Existing Property</Label>
                  <Select onValueChange={setSelectedPropertyId} value={selectedPropertyId}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {properties.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-white">
                          {p.name} — {p.address}, {p.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="button" variant="outline" className="border-slate-600 text-slate-300"
                onClick={() => { setAddingProperty(!addingProperty); setSelectedPropertyId('') }}>
                {addingProperty ? '← Back to existing' : '+ Add New Property'}
              </Button>

              {addingProperty && (
                <div className="space-y-3 pt-2">
                  {[
                    { key: 'name', label: 'Property Name', placeholder: 'Oakwood Apartments' },
                    { key: 'address', label: 'Street Address', placeholder: '123 Main St' },
                    { key: 'city', label: 'City', placeholder: 'Atlanta' },
                    { key: 'state', label: 'State', placeholder: 'GA' },
                    { key: 'zip', label: 'ZIP Code', placeholder: '30301' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <Label className="text-slate-300">{label}</Label>
                      <Input
                        value={newProp[key as keyof typeof newProp]}
                        onChange={e => setNewProp(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        required={addingProperty}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!selectedPropertyId && !addingProperty}>
                Next →
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader><CardTitle className="text-white">Step 2 — Project Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <Label className="text-slate-300">Project Title</Label>
                <Input value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Unit 4B — Bathroom Plumbing Repair" required className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div>
                <Label className="text-slate-300">Project Type</Label>
                <Select onValueChange={val => setProjectForm(p => ({ ...p, projectType: val as ProjectType }))} value={projectForm.projectType}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {Object.entries(PROJECT_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val} className="text-white">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Describe the issue in plain language. What do you see? What&apos;s broken? What needs fixing?</Label>
                <Textarea value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))}
                  rows={4} required className="bg-slate-800 border-slate-600 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300">Budget Min ($) <span className="text-slate-500">optional</span></Label>
                  <Input type="number" value={projectForm.budgetMin} onChange={e => setProjectForm(p => ({ ...p, budgetMin: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Budget Max ($) <span className="text-slate-500">optional</span></Label>
                  <Input type="number" value={projectForm.budgetMax} onChange={e => setProjectForm(p => ({ ...p, budgetMax: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Photos <span className="text-slate-500">up to 5, 10MB each</span></Label>
                <Input type="file" accept="image/*" multiple onChange={handlePhotoSelect}
                  className="bg-slate-800 border-slate-600 text-white file:bg-slate-700 file:text-slate-300 file:border-0" />
                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {photoPreviews.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded border border-slate-600" />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="border-slate-600 text-slate-300">← Back</Button>
                <Button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700">Generate Scope of Work →</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Step 3 — Review Scope of Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatingSow ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full mx-auto mb-4 animate-spin"
                  style={{ borderColor: 'oklch(0.57 0.135 183)', borderTopColor: 'transparent' }} />
                <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>Generating professional Scope of Work…</p>
              </div>
            ) : sowFailed ? (
              <div className="py-10 text-center space-y-4">
                <div className="text-4xl">⚠️</div>
                <div>
                  <p className="font-medium text-white mb-1">SOW generation failed</p>
                  <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
                    The AI couldn&apos;t generate a Scope of Work. You can retry or write it manually.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={retrySow}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                    style={{ background: 'oklch(0.57 0.135 183)' }}
                  >
                    ↺ Retry AI Generation
                  </button>
                  <button
                    onClick={() => setSowFailed(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                  >
                    Write Manually
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Textarea
                  value={sow}
                  onChange={e => setSow(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                  style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>Review and edit before posting.</p>
                  <button
                    onClick={retrySow}
                    className="text-xs transition-colors"
                    style={{ color: 'oklch(0.55 0.02 252)' }}
                  >
                    ↺ Regenerate
                  </button>
                </div>
                <button
                  onClick={handlePublish}
                  disabled={publishing || !sow}
                  className="w-full h-12 rounded-lg text-base font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'oklch(0.57 0.135 183)' }}
                >
                  {publishing ? 'Posting…' : 'Post for Bids'}
                </button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
