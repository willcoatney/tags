'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Supabase puts the session tokens in the URL hash after redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Password updated — signing you in')
    router.push('/')
    router.refresh()
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'oklch(0.13 0.022 252)' }}>
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full mx-auto" />
          <p style={{ color: 'oklch(0.60 0.025 252)' }} className="text-sm">Verifying reset link…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'oklch(0.13 0.022 252)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-10 max-w-[150px] object-contain rounded-md shrink-0" />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Set new password</h2>
          <p style={{ color: 'oklch(0.60 0.025 252)' }}>Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>New Password</Label>
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
          <div className="space-y-1.5">
            <Label className="text-sm font-medium" style={{ color: 'oklch(0.82 0.01 252)' }}>Confirm Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
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
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
