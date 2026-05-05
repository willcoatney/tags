'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, type ProjectType } from '@/lib/types'

const ALL_TYPES = Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]

interface Profile {
  company_name: string
  services: ProjectType[]
  service_zip_codes: string[]
  approval_status: string
}

export default function ContractorProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [services, setServices] = useState<ProjectType[]>([])
  const [zipCodes, setZipCodes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/contractor/profile')
      .then(r => r.json())
      .then(data => {
        setProfile(data)
        setServices(data.services || [])
        setZipCodes((data.service_zip_codes || []).join(', '))
      })
  }, [])

  function toggleService(type: ProjectType) {
    setServices(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type])
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/contractor/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        services,
        service_zip_codes: zipCodes.split(',').map(z => z.trim()).filter(Boolean),
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
        <CardContent className="space-y-4">
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
            <Label className="text-slate-300">Service ZIP Codes <span className="text-slate-500">(comma-separated)</span></Label>
            <Input value={zipCodes} onChange={e => setZipCodes(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white" />
          </div>

          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
