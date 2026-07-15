import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StatusBadge from '@/components/StatusBadge'
import InvitePropertyButton from '@/components/InvitePropertyButton'
import type { Project } from '@/lib/types'

const S = {
  card: { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' },
}

function StatCard({ value, label, accent }: { value: number | string; label: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={S.card}>
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

export default async function AssetManagerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role, full_name, organization_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'asset_manager') redirect('/login')

  const { data: portfolio } = await admin
    .from('portfolios')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!portfolio) redirect('/login')

  // Get portfolio org memberships
  const { data: poRows } = await admin
    .from('portfolio_organizations')
    .select('organization_id')
    .eq('portfolio_id', portfolio.id)

  const orgIds = (poRows || []).map((r: { organization_id: string }) => r.organization_id)

  // Get org names
  const orgNameMap: Record<string, string> = {}
  if (orgIds.length > 0) {
    const { data: orgs } = await admin
      .from('organizations')
      .select('id, name')
      .in('id', orgIds)
    for (const org of orgs || []) {
      orgNameMap[org.id as string] = org.name as string
    }
  }

  let projects: Project[] = []
  if (orgIds.length > 0) {
    const { data } = await admin
      .from('projects')
      .select('*, properties(id, name, city, state, organization_id), bids(id, status, amount)')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })
    projects = (data || []) as Project[]
  }

  // Stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const openCount = projects.filter(p => p.status === 'open').length
  const awardedCount = projects.filter(p => p.status === 'awarded').length
  const completedMTD = projects.filter(
    p => p.status === 'completed' && p.updated_at >= startOfMonth
  ).length

  // Needs attention
  const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()

  type AttentionItem = { project: Project; label: string }
  const attentionItems: AttentionItem[] = []
  for (const p of projects) {
    if (p.status === 'open' && (p.bids?.length ?? 0) === 0 && p.created_at < twoDaysAgo) {
      attentionItems.push({ project: p, label: 'No bids yet' })
    } else if (p.status === 'awarded' && p.updated_at < fourteenDaysAgo) {
      attentionItems.push({ project: p, label: 'Stalled — no completion' })
    }
  }

  // Properties table rows
  type OrgRow = { orgId: string; orgName: string; open: number; active: number; completedMTD: number; total: number }
  const orgRows: OrgRow[] = orgIds.map(orgId => {
    const orgProjects = projects.filter(p => p.organization_id === orgId)
    return {
      orgId,
      orgName: orgNameMap[orgId] ?? '—',
      open: orgProjects.filter(p => p.status === 'open').length,
      active: orgProjects.filter(p => p.status === 'awarded').length,
      completedMTD: orgProjects.filter(p => p.status === 'completed' && p.updated_at >= startOfMonth).length,
      total: orgProjects.length,
    }
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            {portfolio.name}
          </p>
        </div>
        <InvitePropertyButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={openCount} label="Open Projects" accent />
        <StatCard value={awardedCount} label="Awarded / Active" />
        <StatCard value={completedMTD} label="Completed This Month" />
        <StatCard value={orgIds.length} label="Properties in Portfolio" />
      </div>

      {/* Needs Attention */}
      {attentionItems.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-3">⚠️ Needs Attention</h2>
          <div className="space-y-2">
            {attentionItems.map(({ project, label }) => (
              <Link
                key={project.id}
                href={`/dashboard/pm/projects/${project.id}`}
                className="flex items-center gap-3 rounded-xl px-5 py-3 transition-all duration-150"
                style={{ background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.30 0.06 45)' }}
              >
                <StatusBadge status={project.status} />
                <span className="text-sm text-white font-medium truncate flex-1">
                  {(project.properties as { name: string } | undefined)?.name ?? '—'} → {project.title}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'oklch(0.22 0.05 45)', color: 'oklch(0.75 0.10 45)' }}
                >
                  {label}
                </span>
                <span className="text-xs shrink-0" style={{ color: 'oklch(0.55 0.02 252)' }}>
                  {timeAgo(project.created_at)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Properties table */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Properties in Portfolio</h2>
        {orgRows.length === 0 ? (
          <div
            className="rounded-xl flex flex-col items-center justify-center py-12 text-center"
            style={S.card}
          >
            <div className="text-3xl mb-2">🏢</div>
            <p className="font-medium text-white mb-1">No properties yet</p>
            <p className="text-sm" style={{ color: 'oklch(0.55 0.02 252)' }}>
              Invite property managers to join your portfolio using the button above.
            </p>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={S.card}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(0.22 0.022 252)' }}>
                  {['Property / Org', 'Open', 'Active', 'Completed (MTD)', 'Total'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'oklch(0.50 0.02 252)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orgRows.map((row, i) => (
                  <tr
                    key={row.orgId}
                    style={{ borderBottom: i < orgRows.length - 1 ? '1px solid oklch(0.20 0.022 252)' : undefined }}
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <Link
                        href="/dashboard/asset-manager/properties"
                        className="hover:underline"
                        style={{ color: 'white' }}
                      >
                        {row.orgName}
                      </Link>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: row.open > 0 ? 'oklch(0.57 0.135 183)' : 'oklch(0.55 0.02 252)' }}
                    >
                      {row.open}
                    </td>
                    <td className="px-4 py-3 text-white">{row.active}</td>
                    <td className="px-4 py-3" style={{ color: 'oklch(0.72 0.12 145)' }}>{row.completedMTD}</td>
                    <td className="px-4 py-3" style={{ color: 'oklch(0.55 0.02 252)' }}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
