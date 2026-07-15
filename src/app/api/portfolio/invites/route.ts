import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Verify role
  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'asset_manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Get their portfolio
  const { data: portfolio } = await admin
    .from('portfolios')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!portfolio) return NextResponse.json({ error: 'No portfolio found' }, { status: 404 })

  // Insert invite
  const { data: invite, error } = await admin
    .from('portfolio_invites')
    .insert({ portfolio_id: portfolio.id, created_by: user.id })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    token: invite.token,
    inviteUrl: `https://www.tagyourproject.com/join/portfolio/${invite.token}`,
  })
}
