import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/StatusBadge'
import AwardBidButton from '@/components/AwardBidButton'
import type { Bid } from '@/lib/types'

export default async function BidsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'pm') redirect('/login')

  const { data: project } = await admin.from('projects')
    .select('*, properties(*)')
    .eq('id', params.id)
    .eq('organization_id', profile.organization_id)
    .single()

  if (!project) notFound()

  const { data: bids } = await admin.from('bids')
    .select('*, user_profiles(full_name, email, phone), contractor_profiles(company_name, services)')
    .eq('project_id', params.id)
    .order('amount', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bids — {project.title}</h1>
          <p className="text-slate-400 mt-1">{project.properties?.city}, {project.properties?.state} • {bids?.length || 0} bid{bids?.length !== 1 ? 's' : ''}</p>
        </div>
        <Button asChild variant="outline" className="border-slate-600 text-slate-300">
          <Link href={`/dashboard/pm/projects/${params.id}`}>← Project</Link>
        </Button>
      </div>

      {!bids?.length ? (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="py-12 text-center text-slate-400">No bids yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((bid: Bid & { user_profiles: { full_name: string; email: string; phone: string }; contractor_profiles: { company_name: string } }) => (
            <Card key={bid.id} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    {bid.contractor_profiles?.company_name || bid.user_profiles?.full_name}
                  </CardTitle>
                  <StatusBadge status={bid.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">Bid Amount</p>
                    <p className="text-teal-400 text-2xl font-bold">${bid.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide">Timeline</p>
                    <p className="text-white text-lg">{bid.timeline_days} days</p>
                  </div>
                </div>
                {bid.notes && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-slate-300 text-sm">{bid.notes}</p>
                  </div>
                )}
                <p className="text-slate-500 text-xs">Submitted {new Date(bid.submitted_at).toLocaleDateString()}</p>
                {bid.status === 'submitted' && project.status === 'open' && (
                  <AwardBidButton bidId={bid.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
