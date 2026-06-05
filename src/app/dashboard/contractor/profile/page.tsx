'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
}

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<ProjectType[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/contractor/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setServices(data.services || [])
        setSelectedStates(data.service_states || [])
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
      body: JSON.stringify({
        services,
        service_states: selectedStates,
      }),
    })
    if (res.ok) toast.success('Profile updated')
    else toast.error('Failed to save')
    setSaving(false)
  }

  if (!profile) return <div className="text-slate-400 p-8">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

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
