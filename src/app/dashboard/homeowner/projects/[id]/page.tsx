'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import SOWViewer from '@/components/SOWViewer'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

interface Project {
  id: string
  title: string
  project_type: string
  description: string
  scope_of_work: string | null
  sow_payment_intent_id: string | null
  created_at: string
}

export default function HomeownerProjectPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const profileRes = await fetch('/api/homeowner/profile')
      if (!profileRes.ok) { router.push('/login'); return }
      const profile = await profileRes.json()

      const { createClient: createAdmin } = await import('@supabase/supabase-js')
      // Use anon client — RLS handles access
      const { data } = await supabase
        .from('projects')
        .select('id, title, project_type, description, scope_of_work, sow_payment_intent_id, created_at')
        .eq('id', params.id as string)
        .eq('organization_id', profile.organization_id)
        .single()

      if (!data) { router.push('/dashboard/homeowner'); return }
      setProject(data)
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>Loading your SOW…</p>
        </div>
      </div>
    )
  }

  if (!project) return null

  const hasSow = !!project.scope_of_work
  const hasPaid = !!project.sow_payment_intent_id

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
            {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {hasSow && (
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ border: '1px solid oklch(0.27 0.025 252)', color: 'oklch(0.82 0.01 252)', background: 'oklch(0.20 0.022 252)' }}
            >
              🖨️ Print SOW
            </button>
          )}
          <Link
            href="/dashboard/homeowner"
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl p-5" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'oklch(0.55 0.02 252)' }}>Your Description</p>
        <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.75 0.015 252)' }}>{project.description}</p>
      </div>

      {/* SOW or states */}
      {hasSow ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="px-5 py-3 flex items-center gap-2"
            style={{ background: 'oklch(0.16 0.022 252)', borderBottom: '1px solid oklch(0.20 0.022 252)' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.57 0.135 183)' }} />
            <span className="text-sm font-semibold text-white">Scope of Work</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'oklch(0.18 0.06 160)', color: 'oklch(0.70 0.13 160)', border: '1px solid oklch(0.28 0.08 160)' }}>
              ✓ Ready
            </span>
          </div>
          <div className="p-5" style={{ background: 'oklch(0.14 0.022 252)' }}>
            <SOWViewer content={project.scope_of_work!} />
          </div>
          <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            style={{ background: 'oklch(0.16 0.022 252)', borderTop: '1px solid oklch(0.20 0.022 252)' }}>
            <p className="text-xs" style={{ color: 'oklch(0.48 0.015 252)' }}>
              Print this SOW and share it with any contractors you choose. All contractors should bid on the same defined scope.
            </p>
            <button
              onClick={() => window.print()}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>
      ) : hasPaid ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }}>
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-semibold text-white mb-1">Generating your Scope of Work…</p>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>This usually takes under 60 seconds. Refresh the page in a moment.</p>
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.35 0.10 75)' }}>
          <div className="text-3xl mb-3">💳</div>
          <p className="font-semibold text-white mb-1">Payment required to generate your SOW</p>
          <p className="text-sm mb-5" style={{ color: 'oklch(0.55 0.02 252)' }}>Complete payment to receive your professional Scope of Work.</p>
          <Link
            href={`/dashboard/homeowner/projects/${project.id}/pay`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            Complete Payment — $20 →
          </Link>
        </div>
      )}
    </div>
  )
}
