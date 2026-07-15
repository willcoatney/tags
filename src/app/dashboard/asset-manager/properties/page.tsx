import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import InvitePropertyButton from '@/components/InvitePropertyButton'
import type { Project } from '@/lib/types'

const S = {
  card: { background: 'oklch(0.17 0.022 252)', border: '1px solid oklch(0.22 0.022 252)' },
}

export default async function AMPropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'asset_manager') redirect('/login')

  const { data: portfolio } = await admin
    .from('portfolios')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!portfolio) redirect('/login')

  const { data: poRows } = await admin
    .from('portfolio_organizations')
    .select('organization_id')
    .eq('portfolio_id', portfolio.id)

  const orgIds = (poRows || []).map((r: { organization_id: string }) => r.organization_id)

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

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
            {portfolio.name} · {orgIds.length} propert{orgIds.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <InvitePropertyButton />
      </div>

      {/* Table */}
      {orgRows.length === 0 ? (
        <div
          className="rounded-xl flex flex-col items-center justify-center py-16 text-center"
          style={S.card}
        >
          <div className="text-4xl mb-3">🏢</div>
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
                {['Property / Org', 'Open', 'Awarded / Active', 'Completed (MTD)', 'Total Projects'].map(h => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide"
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
                  style={{
                    borderBottom: i < orgRows.length - 1 ? '1px solid oklch(0.20 0.022 252)' : undefined,
                  }}
                >
                  <td className="px-5 py-4 font-medium text-white">{row.orgName}</td>
                  <td
                    className="px-5 py-4 font-medium"
                    style={{ color: row.open > 0 ? 'oklch(0.57 0.135 183)' : 'oklch(0.55 0.02 252)' }}
                  >
                    {row.open}
                  </td>
                  <td className="px-5 py-4 text-white">{row.active}</td>
                  <td className="px-5 py-4" style={{ color: 'oklch(0.72 0.12 145)' }}>
                    {row.completedMTD}
                  </td>
                  <td className="px-5 py-4" style={{ color: 'oklch(0.55 0.02 252)' }}>
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
