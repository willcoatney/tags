'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function RegisterPMForm() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', companyName: '' })
  const [consented, setConsented] = useState(false)
  const [loading, setLoading] = useState(false)
  const [portfolioName, setPortfolioName] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const portfolioToken = searchParams.get('portfolioToken')

  useEffect(() => {
    if (!portfolioToken) return
    fetch(`/api/portfolio/invites/${portfolioToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) setPortfolioName(data.portfolioName)
      })
  }, [portfolioToken])

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!consented) { toast.error('Please agree to the Terms of Service and SMS notifications to continue'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/pm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, portfolioToken: portfolioToken ?? undefined }),
      })
      const orgData = await res.json()
      if (!res.ok) throw new Error(orgData.error || 'Registration failed')

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error

      // Connect portfolio if token present
      if (portfolioToken) {
        await fetch('/api/portfolio/connect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: portfolioToken }),
        })
      }

      // Redirect to Stripe Checkout for $50/month subscription
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'oklch(0.13 0.022 252)' }}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-12 max-w-[160px] object-contain rounded-md mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Property Manager Sign Up</h1>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Create your TAGS account to post repair projects
          </p>
        </div>

        {/* Portfolio invite banner */}
        {portfolioToken && portfolioName && (
          <div
            className="rounded-xl px-4 py-3 mb-5 text-sm font-medium"
            style={{
              background: 'oklch(0.20 0.08 145)',
              border: '1px solid oklch(0.35 0.10 145)',
              color: 'oklch(0.72 0.12 145)',
            }}
          >
            ✓ You&apos;ve been invited to join <strong>{portfolioName}</strong>
          </div>
        )}

        {/* Form card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
        >
          {/* Beta badge */}
          <div className="mb-4 flex">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ background: 'oklch(0.22 0.03 252)', color: 'oklch(0.65 0.02 252)' }}
            >
              🔒 Invite-only beta · $50/community
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="pm-companyName" className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                Company Name
              </Label>
              <Input
                id="pm-companyName"
                type="text"
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                placeholder="Apex Property Group"
                required
                autoComplete="organization"
                className="h-11"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
              />
            </div>

            {[
              { key: 'fullName', label: 'Your Name', type: 'text', placeholder: 'Jane Smith', autoComplete: 'name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com', autoComplete: 'email' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(404) 555-0100', autoComplete: 'tel' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
            ].map(({ key, label, type, placeholder, autoComplete }) => (
              <div key={key}>
                <Label htmlFor={`pm-${key}`} className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                  {label}
                </Label>
                <Input
                  id={`pm-${key}`}
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  required
                  autoComplete={autoComplete}
                  minLength={key === 'password' ? 8 : undefined}
                  className="h-11"
                  style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                />
              </div>
            ))}

            {/* Consent checkbox — required for TCPA compliance and Terms agreement */}
            <label className="flex items-start gap-3 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-teal-500 cursor-pointer flex-shrink-0"
              />
              <span className="text-xs leading-relaxed" style={{ color: 'oklch(0.60 0.025 252)' }}>
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" className="underline" style={{ color: 'oklch(0.57 0.135 183)' }}>Privacy Policy</Link>
                , and I consent to receive text message notifications from TAGS regarding my account, projects, and bids.
                Message &amp; data rates may apply. Reply STOP to opt out.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !consented}
              className="w-full h-11 rounded-lg font-semibold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 mt-2"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPMPage() {
  return (
    <Suspense>
      <RegisterPMForm />
    </Suspense>
  )
}
