'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, US_STATES, type ProjectType } from '@/lib/types'

const ALL_TYPES = Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]

interface InviteData {
  email: string
  name: string | null
  phone: string | null
  inviterName: string | null
  orgName: string | null
  token: string
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [services, setServices] = useState<ProjectType[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [form, setForm] = useState({
    companyName: '', fullName: '', phone: '', password: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/invites/${params.token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setInvalid(true); return }
        setInvite(data)
        setForm(prev => ({ ...prev, fullName: data.name || '', phone: data.phone || '' }))
      })
  }, [params.token])

  function toggleService(type: ProjectType) {
    setServices(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type])
  }

  function toggleState(abbr: string) {
    setSelectedStates(prev => prev.includes(abbr) ? prev.filter(s => s !== abbr) : [...prev, abbr])
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!services.length) { toast.error('Select at least one service type'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/contractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          fullName: form.fullName,
          email: invite!.email,
          phone: form.phone,
          password: form.password,
          services,
          serviceStates: selectedStates,
          inviteToken: params.token,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      const { error } = await supabase.auth.signInWithPassword({
        email: invite!.email,
        password: form.password,
      })
      if (error) throw error

      toast.success('Account created! Welcome to TAGS.')
      router.push('/dashboard/contractor')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'oklch(0.13 0.022 252)' }}>
        <div className="max-w-md w-full text-center rounded-2xl p-10" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-white mb-2">Invite Not Found</h2>
          <p style={{ color: 'oklch(0.55 0.02 252)' }}>This invite link has expired or already been used.</p>
        </div>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'oklch(0.13 0.022 252)' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'oklch(0.57 0.135 183)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'oklch(0.13 0.022 252)' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src="/tags-logo.jpg" alt="TAGS" className="h-12 max-w-[160px] object-contain rounded-md" />
          </div>
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.08 183)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'oklch(0.20 0.08 183)' }}>
              <span className="text-2xl">🏗</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              {invite.inviterName ? `${invite.inviterName} invited you to TAGS` : 'You\'ve been invited to TAGS'}
            </h1>
            {invite.orgName && (
              <p className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>{invite.orgName}</p>
            )}
            <p className="text-sm mt-2" style={{ color: 'oklch(0.60 0.025 252)' }}>
              Your account will be <strong className="text-white">approved automatically</strong> — no waiting for admin review.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <h2 className="text-lg font-semibold text-white mb-5">Create your contractor account</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Email (locked) */}
            <div>
              <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>Email</Label>
              <div className="h-10 px-3 flex items-center rounded-lg text-sm" style={{ background: 'oklch(0.16 0.022 252)', border: '1px solid oklch(0.22 0.022 252)', color: 'oklch(0.55 0.02 252)' }}>
                {invite.email} <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'oklch(0.20 0.022 252)' }}>locked</span>
              </div>
            </div>

            {[
              { key: 'companyName', label: 'Company Name', placeholder: 'Rodriguez Drywall LLC' },
              { key: 'fullName', label: 'Your Name', placeholder: 'Carlos Rodriguez' },
              { key: 'phone', label: 'Phone', placeholder: '(404) 555-0100' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>{label}</Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  className="h-10"
                  style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                />
              </div>
            ))}

            <div>
              <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                minLength={8}
                className="h-10"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: 'oklch(0.72 0.01 252)' }}>Service Types</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TYPES.map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleService(type)}
                    className="px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150"
                    style={{
                      background: services.includes(type) ? 'oklch(0.20 0.06 183)' : 'oklch(0.20 0.022 252)',
                      border: `1px solid ${services.includes(type) ? 'oklch(0.40 0.10 183)' : 'oklch(0.27 0.025 252)'}`,
                      color: services.includes(type) ? 'oklch(0.72 0.12 183)' : 'oklch(0.65 0.02 252)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                Service States <span style={{ color: 'oklch(0.45 0.015 252)' }}>({selectedStates.length} selected)</span>
              </Label>
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {US_STATES.map(({ abbr, name }) => (
                  <button key={abbr} type="button" onClick={() => toggleState(abbr)}
                    title={name}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150"
                    style={{
                      background: selectedStates.includes(abbr) ? 'oklch(0.20 0.06 183)' : 'oklch(0.20 0.022 252)',
                      border: `1px solid ${selectedStates.includes(abbr) ? 'oklch(0.40 0.10 183)' : 'oklch(0.27 0.025 252)'}`,
                      color: selectedStates.includes(abbr) ? 'oklch(0.72 0.12 183)' : 'oklch(0.65 0.02 252)',
                    }}>
                    {abbr}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              {loading ? 'Creating account…' : 'Accept Invite & Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
