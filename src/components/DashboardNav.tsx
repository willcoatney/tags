'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/lib/types'

interface Props { role: UserRole; name: string }

const NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  pm: [
    { href: '/dashboard/pm', label: 'Dashboard' },
    { href: '/dashboard/pm/projects/new', label: '+ New Project' },
  ],
  contractor: [
    { href: '/dashboard/contractor', label: 'Dashboard' },
    { href: '/dashboard/contractor/profile', label: 'My Profile' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard' },
    { href: '/dashboard/admin/contractors', label: 'Contractors' },
  ],
}

export default function DashboardNav({ role, name }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-teal-400 font-bold text-lg tracking-tight">TAGS</Link>
          <div className="hidden md:flex items-center gap-4">
            {NAV_LINKS[role].map(link => (
              <Link key={link.href} href={link.href} className="text-slate-300 hover:text-white text-sm transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-sm hidden md:block">{name}</span>
          <Button variant="outline" size="sm" onClick={signOut} className="border-slate-600 text-slate-300 hover:text-white">
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
