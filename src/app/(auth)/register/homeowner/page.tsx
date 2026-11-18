'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function RegisterHomeownerPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', address: '' })
  const [agreed, setAgreed] = useState(false)
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
      const res = await fetch('/api/auth/register/homeowner', {
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

      router.push('/dashboard/homeowner')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Homeowner Sign Up</CardTitle>
          <CardDescription className="text-slate-400">Get a professional Scope of Work — then share it with any contractor you choose</CardDescription>
          <Link
            href="/samples"
            className="inline-flex items-center gap-1.5 text-xs mt-2 transition-colors hover:underline"
            style={{ color: 'oklch(0.55 0.14 250)' }}
          >
            <FileText size={12} />
            Not sure yet? Browse sample SOWs first →
          </Link>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: 'fullName', label: 'Full Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Phone', type: 'tel' },
              { key: 'address', label: 'Home Address', type: 'text' },
              { key: 'password', label: 'Password', type: 'password' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <Label className="text-slate-300">{label}</Label>
                <Input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={e => set(key, e.target.value)}
                  required
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            ))}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 accent-teal-500 cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-teal-400 hover:underline">Terms of Service</Link>
                {', '}
                <Link href="/legal/homeowner-agreement" target="_blank" className="text-teal-400 hover:underline">Homeowner Agreement</Link>
                {', and '}
                <Link href="/legal/esign" target="_blank" className="text-teal-400 hover:underline">E-Sign Consent</Link>
                . I understand that each SOW costs $20, charged at generation, and is non-refundable.
              </label>
            </div>
            <Button type="submit" disabled={loading || !agreed} className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
