import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import AdminContractorActions from '@/components/AdminContractorActions'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

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
    { data: allBids },
    { data: pendingContractors },
  ] = await Promise.all([
    admin.from('projects').select('*, properties(name, city, state), bids(id)').order('created_at', { ascending: false }).limit(50),
    admin.from('user_profiles').select('*, organizations(name)').order('created_at', { ascending: false }),
    admin.from('bids').select('id, status'),
    admin.from('contractor_profiles').select('*, user_profiles(full_name, email)').eq('approval_status', 'pending'),
  ])

  const totalBids = allBids?.length || 0
  const awardedBids = allBids?.filter(b => b.status === 'awarded').length || 0
  const conversionRate = totalBids ? ((awardedBids / totalBids) * 100).toFixed(1) : '0'

  const stats = [
    { value: allProjects?.filter(p => p.status === 'open').length || 0, label: 'Open Projects', accent: true },
    { value: totalBids, label: 'Total Bids' },
    { value: `${conversionRate}%`, label: 'Conversion Rate' },
    { value: pendingContractors?.length || 0, label: 'Pending Approvals', warn: (pendingContractors?.length || 0) > 0 },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Link href="/dashboard/admin/contractors"
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.65 0.02 252)', border: '1px solid oklch(0.27 0.025 252)' }}>
          All Contractors →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card rounded-xl p-5" style={CARD}>
            <div className="text-3xl font-bold mb-1" style={{
              color: stat.accent ? 'oklch(0.57 0.135 183)' : stat.warn ? 'oklch(0.75 0.12 75)' : 'white'
            }}>
              {stat.value}
            </div>
            <div className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Contractors */}
      {(pendingContractors?.length || 0) > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">
            ⚠ Pending Approvals ({pendingContractors?.length})
          </h2>
          <div className="space-y-2">
            {pendingContractors?.map(contractor => {
              const up = contractor.user_profiles as { full_name?: string; email?: string }
              return (
                <div key={contractor.id} className="rounded-xl px-5 py-4" style={{ ...CARD, borderColor: 'oklch(0.35 0.08 75)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{contractor.company_name}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
                        {up?.full_name} · {up?.email} ·{' '}
                        {contractor.services?.map((s: string) => PROJECT_TYPE_LABELS[s as keyof typeof PROJECT_TYPE_LABELS]).join(', ')} ·{' '}
                        ZIPs: {contractor.service_zip_codes?.join(', ')}
                      </p>
                    </div>
                    <AdminContractorActions contractorId={contractor.id} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">All Projects</h2>
        <div className="rounded-xl overflow-hidden" style={CARD}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                {['Property', 'Title', 'Type', 'Status', 'Bids', 'Created'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProjects?.map((project, i) => (
                <tr key={project.id}
                  className="transition-colors duration-100"
                  style={{
                    borderBottom: i < (allProjects.length - 1) ? '1px solid oklch(0.20 0.022 252)' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.19 0.022 252)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>{project.properties?.name}</td>
                  <td className="px-4 py-3 text-white font-medium">{project.title}</td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>
                    {PROJECT_TYPE_LABELS[project.project_type as keyof typeof PROJECT_TYPE_LABELS]}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={project.status} /></td>
                  <td className="px-4 py-3" style={{ color: 'oklch(0.65 0.02 252)' }}>{project.bids?.length || 0}</td>
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
                {['Name', 'Email', 'Role', 'Organization', 'Joined'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'oklch(0.50 0.02 252)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allUsers?.map((u, i) => (
                <tr key={u.id}
                  style={{ borderBottom: i < (allUsers.length - 1) ? '1px solid oklch(0.20 0.022 252)' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.19 0.022 252)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
