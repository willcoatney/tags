import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

const S = {
  card: { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default async function HomeownerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'homeowner') redirect('/login')

  const { data: projects } = await admin.from('projects')
    .select('*, sow_payment_intent_id')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const totalCount = projects?.length || 0
  const withSowCount = projects?.filter(p => p.scope_of_work).length || 0
  const pendingPaymentCount = projects?.filter(p => !p.sow_payment_intent_id).length || 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            Professional Scope of Work documents for your home repairs
          </p>
        </div>
        <Link
          href="/dashboard/homeowner/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'oklch(0.57 0.135 183)' }}
        >
          <span className="text-base leading-none">+</span>
          Generate New SOW — $20
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-5" style={S.card}>
          <div className="text-3xl font-bold mb-1 text-white">{totalCount}</div>
          <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>Total Projects</div>
        </div>
        <div className="rounded-xl p-5" style={S.card}>
          <div className="text-3xl font-bold mb-1" style={{ color: 'oklch(0.57 0.135 183)' }}>{withSowCount}</div>
          <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>SOWs Generated</div>
        </div>
        <div className="rounded-xl p-5" style={S.card}>
          <div className="text-3xl font-bold mb-1" style={{ color: pendingPaymentCount > 0 ? 'oklch(0.75 0.12 75)' : 'white' }}>{pendingPaymentCount}</div>
          <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>Awaiting Payment</div>
        </div>
      </div>

      {/* Projects list */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Your Projects</h2>

        {!projects?.length ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16 text-center" style={S.card}>
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-white mb-1">No projects yet</p>
            <p className="text-sm mb-4" style={{ color: 'oklch(0.55 0.02 252)' }}>
              Generate your first professional Scope of Work for just $20.
            </p>
            <Link
              href="/dashboard/homeowner/projects/new"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              Generate New SOW — $20
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => {
              const hasSow = !!project.scope_of_work
              const hasPaid = !!project.sow_payment_intent_id
              return (
                <div
                  key={project.id}
                  className="rounded-xl px-5 py-4 transition-all duration-150"
                  style={S.card}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-semibold text-white truncate">{project.title}</h3>
                        {hasSow ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)', border: '1px solid oklch(0.30 0.10 145)' }}>
                            ✓ SOW Ready
                          </span>
                        ) : hasPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: 'oklch(0.20 0.06 183)', color: 'oklch(0.72 0.12 183)', border: '1px solid oklch(0.30 0.08 183)' }}>
                            Generating…
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: 'oklch(0.22 0.08 75)', color: 'oklch(0.85 0.16 75)', border: '1px solid oklch(0.38 0.14 75)' }}>
                            Awaiting Payment
                          </span>
                        )}
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                        {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                        {` · ${timeAgo(project.created_at)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!hasPaid && (
                        <Link
                          href={`/dashboard/homeowner/projects/${project.id}/pay`}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150"
                          style={{ background: 'oklch(0.57 0.135 183)' }}
                        >
                          Pay $20
                        </Link>
                      )}
                      {hasSow && (
                        <Link
                          href={`/dashboard/homeowner/projects/${project.id}`}
                          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                        >
                          View SOW
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
