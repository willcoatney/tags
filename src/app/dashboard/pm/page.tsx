import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import { PROJECT_TYPE_LABELS, JOB_CATEGORY_LABELS, type JobCategory } from '@/lib/types'

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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default async function PMDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles')
    .select('organization_id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'pm') redirect('/login')

  const [{ data: projects }, { data: properties }] = await Promise.all([
    admin.from('projects')
      .select('*, properties(name, city, state)')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false }),
    admin.from('properties')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false }),
  ])

  const totalProjects = projects?.length || 0
  const withSow = projects?.filter(p => p.scope_of_work).length || 0
  const draftCount = projects?.filter(p => p.status === 'draft').length || 0

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {profile.full_name ? `${profile.full_name.split(' ')[0]}'s Dashboard` : 'Dashboard'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            Manage your SOWs and repair projects
          </p>
        </div>
        <Link
          href="/dashboard/pm/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 active:scale-[0.98]"
          style={{ background: 'oklch(0.57 0.135 183)' }}
        >
          <span className="text-base leading-none">+</span>
          New SOW
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={totalProjects} label="Total Projects" accent />
        <StatCard value={withSow} label="SOWs Generated" />
        <StatCard value={draftCount} label="Drafts" />
      </div>

      {/* Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Projects</h2>

        {!projects?.length ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-16 text-center" style={S.card}>
            <div className="text-4xl mb-3">📋</div>
            <p className="font-medium text-white mb-1">No projects yet</p>
            <p className="text-sm mb-4" style={{ color: 'oklch(0.55 0.02 252)' }}>
              Generate your first Scope of Work in under 60 seconds.
            </p>
            <Link href="/dashboard/pm/projects/new"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'oklch(0.57 0.135 183)' }}>
              New SOW
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
                      {project.scope_of_work && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.20 0.07 145)', color: 'oklch(0.75 0.15 145)', border: '1px solid oklch(0.30 0.10 145)' }}>
                          ✓ SOW Ready
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                      {project.job_category && (
                        <span className="font-medium mr-1" style={{ color: 'oklch(0.72 0.12 183)' }}>
                          {JOB_CATEGORY_LABELS[project.job_category as JobCategory]} ·{' '}
                        </span>
                      )}
                      {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                      {project.properties && ` · ${project.properties.name} · ${project.properties.city}`}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Properties */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {properties?.map(prop => (
            <div key={prop.id} className="rounded-xl p-4" style={S.card}>
              <p className="font-medium text-white text-sm">{prop.name}</p>
              <p className="text-xs mt-1" style={{ color: 'oklch(0.55 0.02 252)' }}>
                {prop.address}<br />{prop.city}, {prop.state} {prop.zip}
              </p>
            </div>
          ))}
          <Link
            href="/dashboard/pm/projects/new"
            className="rounded-xl p-4 flex items-center justify-center transition-colors duration-150"
            style={{ border: '1px dashed oklch(0.27 0.025 252)' }}
          >
            <span className="text-sm font-medium" style={{ color: 'oklch(0.57 0.135 183)' }}>+ Add Property</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
