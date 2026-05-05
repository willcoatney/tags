import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import StatusBadge from '@/components/StatusBadge'
import AdminContractorActions from '@/components/AdminContractorActions'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

export default async function AdminContractorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/login')

  const { data: contractors } = await admin.from('contractor_profiles')
    .select('*, user_profiles(full_name, email, phone)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Contractors</h1>
      <div className="space-y-3">
        {contractors?.map(contractor => {
          const up = contractor.user_profiles as { full_name?: string; email?: string; phone?: string }
          return (
            <Card key={contractor.id} className="bg-slate-900 border-slate-700">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="text-white font-medium">{contractor.company_name}</p>
                      <StatusBadge status={contractor.approval_status} />
                    </div>
                    <p className="text-slate-400 text-sm">{up?.full_name} • {up?.email} • {up?.phone}</p>
                    <p className="text-slate-400 text-sm">
                      Services: {contractor.services?.map((s: string) => PROJECT_TYPE_LABELS[s as keyof typeof PROJECT_TYPE_LABELS]).join(', ')}
                    </p>
                    <p className="text-slate-400 text-sm">ZIPs: {contractor.service_zip_codes?.join(', ')}</p>
                    <p className="text-slate-500 text-xs">Applied {new Date(contractor.created_at).toLocaleDateString()}</p>
                  </div>
                  {contractor.approval_status === 'pending' && (
                    <AdminContractorActions contractorId={contractor.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
