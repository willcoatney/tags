import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/StatusBadge'
import AdminContractorActions from '@/components/AdminContractorActions'
import { PROJECT_TYPE_LABELS } from '@/lib/types'

function coiStatusBadge(expDate: string | null, hasUrl: boolean) {
  if (!hasUrl && !expDate) {
    return { label: 'COI: Not uploaded', bg: 'oklch(0.18 0.05 25)', color: 'oklch(0.65 0.15 25)', border: 'oklch(0.28 0.10 25)' }
  }
  if (!expDate) {
    return { label: 'COI: No expiry set', bg: 'oklch(0.18 0.06 75)', color: 'oklch(0.72 0.18 75)', border: 'oklch(0.28 0.10 75)' }
  }
  const exp = new Date(expDate)
  const now = new Date()
  const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return { label: `COI: Expired ${Math.abs(daysLeft)}d ago`, bg: 'oklch(0.18 0.08 25)', color: 'oklch(0.65 0.20 25)', border: 'oklch(0.30 0.12 25)' }
  if (daysLeft <= 30) return { label: `COI: Expires in ${daysLeft}d`, bg: 'oklch(0.18 0.08 75)', color: 'oklch(0.72 0.18 75)', border: 'oklch(0.28 0.12 75)' }
  return { label: `COI: Valid · ${daysLeft}d left`, bg: 'oklch(0.16 0.06 155)', color: 'oklch(0.65 0.15 155)', border: 'oklch(0.26 0.10 155)' }
}

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
          const coi = coiStatusBadge(contractor.coi_expiration_date, !!contractor.insurance_url)
          const hasW9 = !!contractor.w9_url

          return (
            <Card key={contractor.id} className="bg-slate-900 border-slate-700">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white font-medium">{contractor.company_name}</p>
                      <StatusBadge status={contractor.approval_status} />
                    </div>
                    <p className="text-slate-400 text-sm">{up?.full_name} • {up?.email} • {up?.phone}</p>
                    <p className="text-slate-400 text-sm">
                      Services: {contractor.services?.map((s: string) => PROJECT_TYPE_LABELS[s as keyof typeof PROJECT_TYPE_LABELS]).join(', ')}
                    </p>
                    <p className="text-slate-400 text-sm">States: {contractor.service_states?.join(', ') || '—'}</p>

                    {/* Compliance badges */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ background: coi.bg, color: coi.color, border: `1px solid ${coi.border}` }}>
                        {coi.label}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: hasW9 ? 'oklch(0.16 0.06 155)' : 'oklch(0.18 0.05 25)',
                          color: hasW9 ? 'oklch(0.65 0.15 155)' : 'oklch(0.65 0.15 25)',
                          border: `1px solid ${hasW9 ? 'oklch(0.26 0.10 155)' : 'oklch(0.28 0.10 25)'}`,
                        }}>
                        {hasW9 ? 'W-9: On file' : 'W-9: Missing'}
                      </span>
                      {contractor.insurance_url && (
                        <a href={contractor.insurance_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
                          View COI
                        </a>
                      )}
                      {contractor.license_url && (
                        <a href={contractor.license_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
                          View License
                        </a>
                      )}
                      {contractor.w9_url && (
                        <a href={contractor.w9_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs underline" style={{ color: 'oklch(0.57 0.135 183)' }}>
                          View W-9
                        </a>
                      )}
                    </div>

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
