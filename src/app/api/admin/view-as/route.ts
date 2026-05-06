import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  // Get the target user's email
  const { data: targetUser } = await admin.auth.admin.getUserById(userId)
  if (!targetUser?.user?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Generate a magic link for the target user
  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: targetUser.user.email,
    options: { redirectTo: 'https://www.tagyourproject.com/' },
  })

  if (error || !linkData) return NextResponse.json({ error: error?.message }, { status: 500 })

  return NextResponse.json({ url: linkData.properties?.action_link })
}
