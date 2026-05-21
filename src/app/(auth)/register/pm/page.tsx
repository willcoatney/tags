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

export default function RegisterPMPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', companyName: '' })
  const [unitCount, setUnitCount] = useState('')
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
      // 1. Create organization
      const orgRes = await fetch('/api/auth/register/pm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, unitCount: unitCount ? parseInt(unitCount, 10) : undefined }),
      })
      const orgData = await orgRes.json()
      if (!orgRes.ok) throw new Error(orgData.error || 'Registration failed')

      // 2. Sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error

      router.push('/dashboard/pm')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
      setLoading(false)
    }
  }

  const estimatedMonthly = unitCount && parseInt(unitCount, 10) > 0 ? parseInt(unitCount, 10) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Property Manager Sign Up</CardTitle>
          <CardDescription className="text-slate-400">Create your TAGS account to post repair projects</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label className="text-slate-300">Company Name</Label>
              <Input
                type="text"
                value={form.companyName}
                onChange={e => set('companyName', e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Units Under Management</Label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 200"
                value={unitCount}
                onChange={e => setUnitCount(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Your monthly rate is $1 per unit</p>
              {estimatedMonthly && (
                <p className="text-xs text-teal-400 mt-0.5">Est. monthly: ${estimatedMonthly}/mo</p>
              )}
            </div>

            {[
              { key: 'fullName', label: 'Your Name', type: 'text' },
              { key: 'email', label: 'Email', type: 'email' },
              { key: 'phone', label: 'Phone', type: 'tel' },
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
            <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
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
