'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/types'
import ThemeToggle from '@/components/ThemeToggle'

interface Props { role: UserRole; name: string }

const NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  pm: [
    { href: '/dashboard/pm', label: 'Dashboard' },
    { href: '/dashboard/pm/projects/new', label: 'New Project' },
    { href: '/dashboard/pm/contractors', label: 'Contractors' },
    { href: '/dashboard/settings', label: 'Settings' },
  ],
  contractor: [
    { href: '/dashboard/contractor', label: 'Dashboard' },
    { href: '/dashboard/contractor/profile', label: 'Profile' },
    { href: '/dashboard/settings', label: 'Settings' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/dashboard/admin/contractors', label: 'Contractors' },
  ],
  homeowner: [
    { href: '/dashboard/homeowner', label: 'Dashboard' },
    { href: '/dashboard/pm/projects/new', label: 'New Project' },
    { href: '/dashboard/settings', label: 'Settings' },
  ],
  asset_manager: [
    { href: '/dashboard/asset-manager', label: 'Portfolio' },
    { href: '/dashboard/asset-manager/projects', label: 'All Projects' },
    { href: '/dashboard/asset-manager/properties', label: 'Properties' },
    { href: '/dashboard/settings', label: 'Settings' },
  ],
}

const ROLE_LABELS: Record<UserRole, string> = {
  pm: 'Property Manager',
  contractor: 'Contractor',
  admin: 'Admin',
  homeowner: 'Homeowner',
  asset_manager: 'Regional Manager',
}

export default function DashboardNav({ role, name }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo + links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 mr-2 shrink-0">
          <img src="/tags-logo.jpg" alt="TAGS" className="h-8 max-w-[110px] object-contain rounded-md shrink-0" />
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS[role].map(link => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150"
                style={{
                  color: active ? 'white' : 'oklch(0.60 0.025 252)',
                  background: active ? 'oklch(0.22 0.022 252)' : 'transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'oklch(0.82 0.01 252)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'oklch(0.60 0.025 252)' }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'oklch(0.57 0.135 183)' }}
          >
            {initials || role[0].toUpperCase()}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white leading-none">{name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'oklch(0.55 0.02 252)' }}>{ROLE_LABELS[role]}</p>
          </div>
        </div>

        <ThemeToggle />

        <button
          onClick={signOut}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150"
          style={{ color: 'oklch(0.55 0.02 252)', border: '1px solid oklch(0.22 0.022 252)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'oklch(0.82 0.01 252)'
            e.currentTarget.style.borderColor = 'oklch(0.32 0.025 252)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'oklch(0.55 0.02 252)'
            e.currentTarget.style.borderColor = 'oklch(0.22 0.022 252)'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
