import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import ViewAsButton from '@/components/ViewAsButton'
import { PROJECT_TYPE_LABELS, JOB_CATEGORY_LABELS, type JobCategory } from '@/lib/types'

const CARD = { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const [
    { data: allProjects },
    { data: allUsers },
  ] = await Promise.all([
    admin.from('projects').select('*, properties(name, city, state)').order('created_at', { ascending: false }).limit(50),
    admin.from('user_profiles').select('*, organizations(name)').order('created_at', { ascending: false }),
  ])

  const pmCount = allUsers?.filter(u => u.role === 'pm').length || 0
  const homeownerCount = allUsers?.filter(u => u.role === 'homeowner').length || 0
  const totalProjects = allProjects?.length || 0
  const withSow = allProjects?.filter(p => p.scope_of_work).length || 0

  const stats = [
    { value: pmCount, label: 'Property Managers', accent: true },
    { value: homeownerCount, label: 'Homeowners' },
    { value: totalProjects, label: 'Total Projects' },
    { value: withSow, label: 'SOWs Generated', accent: true },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Link href="/dashboard/admin/error-logs"
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
          Error Logs →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card rounded-xl p-5" style={CARD}>
            <div className="text-3xl font-bold mb-1" style={{
              color: stat.accent ? 'oklch(0.57 0.135 183)' : 'white'
            }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* All Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">All Projects</h2>
        <div className="rounded-xl overflow-hidden" style={CARD}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                {['Property', 'Title', 'Type', 'Status', 'SOW', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProjects?.map((project, i) => (
                <tr key={project.id}
                  className="transition-colors duration-100 hover:bg-slate-800/50"
                  style={{
                    borderBottom: i < (allProjects.length - 1) ? '1px solid oklch(0.20 0.022 252)' : 'none',
                  }}
                >
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>{project.properties?.name}</td>
                  <td className="px-4 py-3 text-white font-medium">{project.title}</td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>
                    {project.job_category && (
                      <span className="block text-xs font-medium mb-0.5" style={{ color: 'oklch(0.72 0.12 183)' }}>
                        {JOB_CATEGORY_LABELS[project.job_category as JobCategory]}
                      </span>
                    )}
                    {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                  <td className="px-4 py-3">
                    {project.scope_of_work ? (
                      <span className="text-xs" style={{ color: 'oklch(0.70 0.13 160)' }}>✓ Ready</span>
                    ) : (
                      <span className="text-xs" style={{ color: 'oklch(0.45 0.015 252)' }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.50 0.02 252)' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All Users */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">All Users</h2>
        <div className="rounded-xl overflow-hidden" style={CARD}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                {['Name', 'Email', 'Role', 'Organization', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers?.map((u, i) => (
                <tr key={u.id}
                  className="transition-colors duration-100 hover:bg-slate-800/50"
                  style={{ borderBottom: i < (allUsers.length - 1) ? '1px solid oklch(0.20 0.022 252)' : 'none' }}
                >
                  <td className="px-4 py-3 text-white">{u.full_name || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>{u.email}</td>
                  <td className="px-4 py-3"><span className="capitalize" style={{ color: 'oklch(0.57 0.135 183)' }}>{u.role}</span></td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>
                    {(u.organizations as { name?: string })?.name || '—'}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.50 0.02 252)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <ViewAsButton userId={u.id} name={u.full_name || u.email || ''} role={u.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
