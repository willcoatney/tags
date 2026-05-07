'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' })
  const [role, setRole] = useState('')

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setForm({
            full_name: data.profile.full_name || '',
            phone: data.profile.phone || '',
            email: data.email || '',
          })
          setRole(data.profile.role)
        }
        setLoading(false)
      })
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: form.full_name, phone: form.phone }),
    })
    if (res.ok) {
      toast.success('Profile updated')
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to save')
    }
    setSaving(false)
  }

  if (loading) return <div className="text-slate-400 p-8">Loading…</div>

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Keep your contact info up to date so TAGS notifications reach you.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-slate-300">Full Name</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input
                value={form.email}
                disabled
                className="bg-slate-800 border-slate-600 text-slate-500 mt-1"
              />
              <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.015 252)' }}>Email cannot be changed here.</p>
            </div>
            <div>
              <Label className="text-slate-300">
                Mobile Phone <span className="text-teal-400 text-xs ml-1">Required for SMS notifications</span>
              </Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="bg-slate-800 border-slate-600 text-white mt-1"
                placeholder="+1 (816) 555-0100"
              />
              <p className="text-xs mt-1" style={{ color: 'oklch(0.45 0.015 252)' }}>
                {role === 'contractor'
                  ? 'You\'ll receive bid award notifications and project messages here.'
                  : 'You\'ll receive bid notifications and contractor replies here.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
