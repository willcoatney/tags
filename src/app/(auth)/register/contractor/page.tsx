'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { PROJECT_TYPE_LABELS, US_STATES, type ProjectType } from '@/lib/types'

const ALL_TYPES = Object.entries(PROJECT_TYPE_LABELS) as [ProjectType, string][]

export default function RegisterContractorPage() {
  const [form, setForm] = useState({
    companyName: '', fullName: '', email: '', phone: '', password: '',
  })
  const [services, setServices] = useState<ProjectType[]>([])
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [consented, setConsented] = useState(false)
  const [licenseCertified, setLicenseCertified] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function toggleService(type: ProjectType) {
    setServices(prev => prev.includes(type) ? prev.filter(s => s !== type) : [...prev, type])
  }

  function toggleState(abbr: string) {
    setSelectedStates(prev => prev.includes(abbr) ? prev.filter(s => s !== abbr) : [...prev, abbr])
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!services.length) { toast.error('Select at least one service type'); return }
    if (!consented) { toast.error('Please agree to the Terms of Service and SMS notifications to continue'); return }
    if (!licenseCertified) { toast.error('Please certify that you hold all required licenses and insurance'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/contractor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          services,
          serviceStates: selectedStates,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      if (error) throw error

      // Redirect to Stripe Checkout for $100/year subscription
      const checkoutRes = await fetch('/api/stripe/checkout', { method: 'POST' })
      const checkoutData = await checkoutRes.json()
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        router.push('/dashboard/billing')
        router.refresh()
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Contractor Sign Up</CardTitle>
          <CardDescription className="text-slate-400">Apply to join TAGS and start receiving qualified leads</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: 'companyName', label: 'Company Name', type: 'text', autoComplete: 'organization' },
              { key: 'fullName', label: 'Your Name', type: 'text', autoComplete: 'name' },
              { key: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
              { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
              { key: 'password', label: 'Password', type: 'password', autoComplete: 'new-password' },
            ].map(({ key, label, type, autoComplete }) => (
              <div key={key}>
                <Label htmlFor={`contractor-${key}`} className="text-slate-300">{label}</Label>
                <Input
                  id={`contractor-${key}`}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  required
                  autoComplete={autoComplete}
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            ))}

            <div>
              <Label className="text-slate-300">Service Types</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ALL_TYPES.map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleService(type)}
                    className={`px-3 py-2 rounded text-sm text-left border transition-colors ${
                      services.includes(type)
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-slate-300 block mb-2">
                Service States <span className="text-slate-500 text-xs ml-1">({selectedStates.length} selected)</span>
              </Label>
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
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

            {/* TCPA SMS consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-teal-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-teal-400 underline">Terms of Service</Link>
                ,{' '}
                <Link href="/privacy" target="_blank" className="text-teal-400 underline">Privacy Policy</Link>
                , and{' '}
                <Link href="/legal/contractor-agreement" target="_blank" className="text-teal-400 underline">Contractor Agreement</Link>
                . I consent to receive text message notifications from TAGS regarding my account, leads, and bids.
                Message &amp; data rates may apply. Reply STOP to opt out.
              </span>
            </label>

            {/* Licensing & insurance certification */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={licenseCertified}
                onChange={e => setLicenseCertified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-teal-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs text-slate-400 leading-relaxed">
                I certify that I hold all licenses and insurance required by my state and trade(s),
                and that I am solely responsible for maintaining them. I understand TAGS does not verify
                licensing and assumes no liability for work performed on the platform.
              </span>
            </label>

            <Button type="submit" disabled={loading || !consented || !licenseCertified} className="w-full bg-teal-600 hover:bg-teal-700">
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
            <p className="text-xs text-slate-500 text-center">Applications are reviewed by TAGS admin before activation.</p>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
