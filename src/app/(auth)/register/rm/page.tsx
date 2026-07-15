'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function RegisterRMPage() {
  const [form, setForm] = useState({
    portfolioName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register/rm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error

      router.push('/dashboard/asset-manager')
      router.refresh()
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
          <h1 className="text-2xl font-bold text-white">Regional Manager Sign Up</h1>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.60 0.025 252)' }}>
            Create your TAGS account to oversee your portfolio
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}
        >
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                Portfolio Name
              </Label>
              <Input
                type="text"
                value={form.portfolioName}
                onChange={e => set('portfolioName', e.target.value)}
                placeholder="Sunridge Residential Group"
                required
                className="h-11"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
              />
            </div>

            {[
              { key: 'fullName', label: 'Your Full Name', type: 'text', placeholder: 'Jane Smith' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'jane@example.com' },
              { key: 'phone', label: 'Phone', type: 'tel', placeholder: '(404) 555-0100' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <Label className="text-sm font-medium mb-1.5 block" style={{ color: 'oklch(0.72 0.01 252)' }}>
                  {label}
                </Label>
                <Input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  required
                  minLength={key === 'password' ? 8 : undefined}
                  className="h-11"
                  style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
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
