'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, US_STATES, type ProjectType } from '@/lib/types'

const ALL_TYPES = Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]

interface Review {
  rating: number
  comment: string | null
  created_at: string
  project_title: string | null
}

interface Profile {
  company_name: string
  services: ProjectType[]
  service_states: string[]
  approval_status: string
  ratings: Review[]
  avgRating: number | null
  ratingCount: number
  w9_url: string | null
  insurance_url: string | null
  license_url: string | null
  coi_expiration_date: string | null
}

function coiStatus(expDate: string | null): { label: string; color: string } {
  if (!expDate) return { label: 'Not set', color: 'oklch(0.55 0.02 252)' }
  const exp = new Date(expDate)
  const now = new Date()
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: 'Expired', color: 'oklch(0.60 0.20 25)' }
  if (daysLeft <= 30) return { label: `Expires in ${daysLeft}d`, color: 'oklch(0.72 0.18 75)' }
  return { label: `Valid · ${daysLeft}d remaining`, color: 'oklch(0.65 0.15 155)' }
}

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<ProjectType[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [coiExpDate, setCoiExpDate] = useState('')
  const [savingCoi, setSavingCoi] = useState(false)
  const [uploadingW9, setUploadingW9] = useState(false)
  const [uploadingCoi, setUploadingCoi] = useState(false)
  const w9InputRef = useRef<HTMLInputElement>(null)
  const coiInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/contractor/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setServices(data.services || [])
        setSelectedStates(data.service_states || [])
        setCoiExpDate(data.coi_expiration_date || '')
      })
  }, [])

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function toggleService(type: ProjectType) {
    setServices(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type])
  }

  function toggleState(abbr: string) {
    setSelectedStates(prev => prev.includes(abbr) ? prev.filter(s => s !== abbr) : [...prev, abbr])
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/contractor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services, service_states: selectedStates }),
    })
    if (res.ok) toast.success('Profile updated')
    else toast.error('Failed to save')
    setSaving(false)
  }

  async function handleSaveCoiDate() {
    setSavingCoi(true)
    const res = await fetch('/api/contractor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coi_expiration_date: coiExpDate || null }),
    })
    if (res.ok) {
      setProfile(p => p ? { ...p, coi_expiration_date: coiExpDate || null } : p)
      toast.success('COI expiration date saved')
    } else {
      toast.error('Failed to save')
    }
    setSavingCoi(false)
  }

  async function handleDocUpload(file: File, docType: 'w9' | 'coi') {
    const setUploading = docType === 'w9' ? setUploadingW9 : setUploadingCoi
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('docType', docType)
    const res = await fetch('/api/upload/contractor-doc', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setProfile(p => p ? {
        ...p,
        ...(docType === 'w9' ? { w9_url: url } : { insurance_url: url }),
      } : p)
      toast.success(`${docType === 'w9' ? 'W-9' : 'COI'} uploaded successfully`)
    } else {
      const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
      toast.error(error || 'Upload failed')
    }
    setUploading(false)
  }

  if (!profile) return <div className="text-slate-400 p-8">Loading...</div>

  const coi = coiStatus(profile.coi_expiration_date)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {/* Compliance Documents */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Compliance Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* W-9 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">W-9 Form</Label>
              {profile.w9_url ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'oklch(0.18 0.08 155)', color: 'oklch(0.65 0.15 155)', border: '1px solid oklch(0.28 0.10 155)' }}>
                  ✓ On file
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'oklch(0.18 0.05 25)', color: 'oklch(0.65 0.15 25)', border: '1px solid oklch(0.28 0.10 25)' }}>
                  Missing
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Required for tax compliance. TAGS uses your W-9 to issue a 1099 when your annual earnings through the platform exceed $600.
            </p>
            <div className="flex items-center gap-3">
              <input
                ref={w9InputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f, 'w9') }}
              />
              <button
                onClick={() => w9InputRef.current?.click()}
                disabled={uploadingW9}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'oklch(0.22 0.025 252)', border: '1px solid oklch(0.32 0.025 252)', color: 'oklch(0.72 0.01 252)' }}
              >
                {uploadingW9 ? 'Uploading…' : profile.w9_url ? '↑ Replace W-9' : '↑ Upload W-9'}
              </button>
              {profile.w9_url && (
                <a href={profile.w9_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
                  View current
                </a>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* COI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">Certificate of Insurance (COI)</Label>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.16 0.02 252)', color: coi.color, border: `1px solid ${coi.color}` }}>
                {coi.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              PMs require active general liability coverage before awarding work. Upload your current COI and set the expiration date — you&apos;ll be flagged automatically when it&apos;s about to lapse.
            </p>

            {/* Expiration date */}
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1">
                <Label className="text-slate-400 text-xs mb-1 block">COI Expiration Date</Label>
                <Input
                  type="date"
                  value={coiExpDate}
                  onChange={e => setCoiExpDate(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <Button
                onClick={handleSaveCoiDate}
                disabled={savingCoi}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 shrink-0"
              >
                {savingCoi ? 'Saving…' : 'Save Date'}
              </Button>
            </div>

            {/* COI file upload */}
            <div className="flex items-center gap-3">
              <input
                ref={coiInputRef}
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleDocUpload(f, 'coi') }}
              />
              <button
                onClick={() => coiInputRef.current?.click()}
                disabled={uploadingCoi}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: 'oklch(0.22 0.025 252)', border: '1px solid oklch(0.32 0.025 252)', color: 'oklch(0.72 0.01 252)' }}
              >
                {uploadingCoi ? 'Uploading…' : profile.insurance_url ? '↑ Replace COI' : '↑ Upload COI'}
              </button>
              {profile.insurance_url && (
                <a href={profile.insurance_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
                  View current
                </a>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Services & States */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader><CardTitle className="text-white">Company: {profile.company_name}</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-slate-300">Service Types</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALL_TYPES.map(([type, label]) => (
                <button key={type} type="button" onClick={() => toggleService(type)}
                  className={`px-3 py-2 rounded text-sm text-left border transition-colors ${
                    services.includes(type)
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-slate-300 block mb-2">
              Service States <span className="text-slate-500 text-xs ml-1">({selectedStates.length} selected)</span>
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-64 overflow-y-auto pr-1">
              {US_STATES.map(({ abbr, name }) => (
                <button key={abbr} type="button" onClick={() => toggleState(abbr)}
                  title={name}
                  className={`px-2 py-1.5 rounded text-xs font-medium border transition-colors ${
                    selectedStates.includes(abbr)
                      ? 'bg-teal-600 border-teal-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}>
                  {abbr}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Ratings & Reviews */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>My Ratings & Reviews</span>
            {profile.avgRating !== null && (
              <span className="flex items-center gap-2 text-base font-normal">
                <span style={{ color: 'oklch(0.80 0.18 75)' }}>
                  {'★'.repeat(Math.round(profile.avgRating))}{'☆'.repeat(5 - Math.round(profile.avgRating))}
                </span>
                <span className="text-white font-semibold">{profile.avgRating}</span>
                <span className="text-slate-400 text-sm">({profile.ratingCount} review{profile.ratingCount !== 1 ? 's' : ''})</span>
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!profile.ratings?.length ? (
            <p className="text-slate-400 text-sm py-4 text-center">
              No reviews yet — ratings appear here after a PM marks a job complete.
            </p>
          ) : (
            <div className="space-y-4">
              {profile.ratings.map((r, i) => (
                <div key={i} className="rounded-lg p-4 border border-slate-700 bg-slate-800">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span style={{ color: 'oklch(0.80 0.18 75)', fontSize: '1.1rem' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </span>
                      {r.project_title && (
                        <span className="ml-2 text-xs text-slate-400">{r.project_title}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{formatDate(r.created_at)}</span>
                  </div>
                  {r.comment ? (
                    <p className="text-sm text-slate-300 leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No written review</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
