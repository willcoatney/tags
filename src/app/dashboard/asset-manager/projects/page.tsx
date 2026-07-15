import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AMProjectsFeed from './AMProjectsFeed'
import type { Project } from '@/lib/types'

export default async function AMProjectsPage() {
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

  let projects: (Project & { orgName?: string })[] = []
  if (orgIds.length > 0) {
    const { data } = await admin
      .from('projects')
      .select('*, properties(id, name, city, state, organization_id), bids(id, status, amount)')
      .in('organization_id', orgIds)
      .order('created_at', { ascending: false })
    projects = ((data || []) as Project[]).map(p => ({
      ...p,
      orgName: orgNameMap[p.organization_id] ?? undefined,
    }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">All Projects</h1>
        <p className="text-sm mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>
          {portfolio.name}
        </p>
      </div>
      <AMProjectsFeed projects={projects} />
    </div>
  )
}
