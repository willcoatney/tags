import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('portfolio_invites')
    .select('id, portfolio_id, used_by_org_id, expires_at')
    .eq('token', token)
    .is('used_by_org_id', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ valid: false })

  // Get portfolio info
  const { data: portfolio } = await admin
    .from('portfolios')
    .select('name, owner_id')
    .eq('id', invite.portfolio_id)
    .single()

  if (!portfolio) return NextResponse.json({ valid: false })

  // Get owner name
  const { data: owner } = await admin
    .from('user_profiles')
    .select('full_name')
    .eq('id', portfolio.owner_id)
    .single()

  return NextResponse.json({
    valid: true,
    portfolioName: portfolio.name as string,
    ownerName: (owner?.full_name as string | null) ?? 'Regional Manager',
  })
}
