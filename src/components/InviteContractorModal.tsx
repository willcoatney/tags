'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function InviteContractorModal() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [notified, setNotified] = useState({ email: false, sms: false })

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/invites/contractor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || undefined }),
    })
    const data = await res.json()
    if (res.ok) {
      setSent(true)
      setInviteUrl(data.inviteUrl)
      setNotified({ email: data.emailSent, sms: data.smsSent })
    } else {
      toast.error(data.error || 'Failed to send invite')
      setLoading(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setTimeout(() => { setSent(false); setForm({ name: '', email: '', phone: '' }); setLoading(false); setNotified({ email: false, sms: false }) }, 300)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
        style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
      >
        + Invite Contractor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}>
          <div className="w-full max-w-md rounded-2xl p-6 animate-slide-up"
            style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.27 0.025 252)' }}>

            {sent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'oklch(0.18 0.06 160)' }}>
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Invite Sent!</h3>
                <p className="text-sm mb-2" style={{ color: 'oklch(0.60 0.025 252)' }}>
                  Invite created for <strong className="text-white">{form.name || form.email}</strong>. They&apos;ll be auto-approved when they sign up.
                </p>
                <div className="flex justify-center gap-3 mb-4 text-xs" style={{ color: 'oklch(0.55 0.02 252)' }}>
                  <span>{notified.email ? '📧 Email sent' : '📧 Email not configured'}</span>
                  {form.phone && <span>{notified.sms ? '📱 Text sent' : '📱 Text failed'}</span>}
                </div>
                {inviteUrl && (
                  <div className="mb-4">
                    <p className="text-xs mb-2" style={{ color: 'oklch(0.50 0.02 252)' }}>Or share this link directly:</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={inviteUrl}
                        className="flex-1 h-8 px-2 rounded text-xs"
                        style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.65 0.02 252)' }}
                      />
                      <button
                        onClick={() => { navigator.clipboard.writeText(inviteUrl); toast.success('Link copied!') }}
                        className="px-3 h-8 rounded text-xs font-medium text-white"
                        style={{ background: 'oklch(0.57 0.135 183)' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={handleClose} className="text-sm" style={{ color: 'oklch(0.57 0.135 183)' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-white">Invite a Contractor</h3>
                  <button onClick={handleClose} className="text-lg leading-none" style={{ color: 'oklch(0.45 0.015 252)' }}>×</button>
                </div>
                <p className="text-sm mb-5" style={{ color: 'oklch(0.60 0.025 252)' }}>
                  Invited contractors are <strong className="text-white">auto-approved</strong> — no admin review required.
                </p>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                      Contractor Name <span style={{ color: 'oklch(0.45 0.015 252)' }}>optional</span>
                    </Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Rodriguez Drywall"
                      className="h-10"
                      style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="contractor@example.com"
                      required
                      className="h-10"
                      style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                      Mobile Number <span style={{ color: 'oklch(0.45 0.015 252)' }}>optional — for text invite</span>
                    </Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="(555) 867-5309"
                      className="h-10"
                      style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'oklch(0.57 0.135 183)' }}
                  >
                    {loading ? 'Sending…' : 'Send Invite'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
