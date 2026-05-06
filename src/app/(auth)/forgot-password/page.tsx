'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.tagyourproject.com/reset-password',
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'oklch(0.13 0.022 252)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg tags-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="text-white font-semibold text-lg">TAGS</span>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📬</div>
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p style={{ color: 'oklch(0.60 0.025 252)' }} className="text-sm leading-relaxed">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>. Check your inbox and follow the link to set a new password.
            </p>
            <Link href="/login" className="block mt-6 text-sm font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Forgot password?</h2>
              <p style={{ color: 'oklch(0.60 0.025 252)' }}>Enter your email and we&apos;ll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-white transition-all duration-150 active:scale-[0.98]"
                style={{ background: loading ? 'oklch(0.45 0.1 183)' : 'oklch(0.57 0.135 183)' }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/login" className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
