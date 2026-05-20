import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

const S = {
  card: { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' },
}

function StatCard({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="stat-card rounded-xl p-5" style={S.card}>
      <div className="text-3xl font-bold mb-1" style={{ color: accent ? 'oklch(0.57 0.135 183)' : 'white' }}>
        {value}
      </div>
      <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{label}</div>
    </div>
  )
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
    .select('*, properties(name, city, state), bids(id)')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  const openCount = projects?.filter(p => p.status === 'open').length || 0
  const awaitingBidsCount = projects?.filter(p => p.status === 'open' && (p.bids?.length || 0) === 0).length || 0
  const completedCount = projects?.filter(p => p.status === 'completed').length || 0

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'today'
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Home Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            Post repair projects and receive bids from vetted contractors
          </p>
        </div>
        <Link
          href="/dashboard/pm/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'oklch(0.57 0.135 183)' }}
        >
          <span className="text-base leading-none">+</span>
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={openCount} label="Open Projects" accent />
        <StatCard value={awaitingBidsCount} label="Awaiting Bids" />
        <StatCard value={completedCount} label="Completed" />
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Projects</h2>

        {!projects?.length ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16 text-center" style={S.card}>
            <div className="text-4xl mb-3">🏠</div>
            <p className="font-medium text-white mb-1">No projects yet</p>
            <p className="text-sm mb-4" style={{ color: 'oklch(0.55 0.02 252)' }}>
              Post your first home repair project and get bids from vetted contractors.
            </p>
            <Link
              href="/dashboard/pm/projects/new"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}
            >
              Post First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project.id}
                className="rounded-xl px-5 py-4 transition-all duration-150 hover:border-[oklch(0.32_0.025_252)]"
                style={S.card}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-semibold text-white truncate">{project.title}</h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                      {project.properties && ` · ${project.properties.name} · ${project.properties.city}`}
                      {` · ${project.bids?.length || 0} bid${project.bids?.length !== 1 ? 's' : ''}`}
                      {` · ${timeAgo(project.created_at)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/pm/projects/${project.id}`}
                      className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
                      style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}
                    >
                      View
                    </Link>
                    {project.status === 'open' && (project.bids?.length || 0) > 0 && (
                      <Link
                        href={`/dashboard/pm/projects/${project.id}/bids`}
                        className="px-3 py-1.5 rounded-md text-xs font-semibold text-white transition-all duration-150"
                        style={{ background: 'oklch(0.57 0.135 183)' }}
                      >
                        Review Bids ({project.bids?.length})
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
