'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'oklch(0.13 0.022 252)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'oklch(0.15 0.025 252)', borderRight: '1px solid oklch(0.27 0.025 252)' }}>
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg tags-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">TAGS</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Property repair,<br />
            <span style={{ color: 'oklch(0.57 0.135 183)' }}>professionally managed.</span>
          </h1>
          <p style={{ color: 'oklch(0.60 0.025 252)' }} className="text-lg leading-relaxed">
            Describe a problem. Get a professional Scope of Work in seconds. Collect bids from vetted contractors.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: '📋', text: 'AI-generated Scope of Work from a photo and description' },
            { icon: '🏗', text: 'Vetted contractors compete for your projects' },
            { icon: '📱', text: 'SMS and email alerts at every step' },
          ].map(item => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xl">{item.icon}</span>
              <p style={{ color: 'oklch(0.72 0.02 252)' }} className="text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg tags-gradient flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-semibold text-lg">TAGS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p style={{ color: 'oklch(0.60 0.025 252)' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="h-11 input-focus"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>Password</Label>
                <Link href="/forgot-password" className="text-xs" style={{ color: 'oklch(0.57 0.135 183)' }}>
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 input-focus"
                style={{ background: 'oklch(0.20 0.022 252)', border: '1px solid oklch(0.27 0.025 252)', color: 'white' }}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-white transition-all duration-150 active:scale-[0.98]"
              style={{ background: loading ? 'oklch(0.45 0.1 183)' : 'oklch(0.57 0.135 183)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6" style={{ borderTop: '1px solid oklch(0.22 0.022 252)' }}>
            <p className="text-center text-sm mb-3" style={{ color: 'oklch(0.55 0.02 252)' }}>Don&apos;t have an account?</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/register/pm"
                className="flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(0.38 0.03 252)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(0.27 0.025 252)')}>
                Property Manager
              </Link>
              <Link href="/register/contractor"
                className="flex items-center justify-center h-10 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'oklch(0.38 0.03 252)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'oklch(0.27 0.025 252)')}>
                Contractor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
