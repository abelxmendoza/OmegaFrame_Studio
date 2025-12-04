'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import Logo from './Logo'
import PersistenceStatus from './PersistenceStatus'
import { useProjectSync } from '@/hooks/useProjectSync'

export default function ProjectNav() {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string

  // Check if Supabase is configured
  const supabaseEnabled = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  // Use persistence hook (will gracefully degrade if not configured)
  const { isInitialLoad, isSaving, lastSaved } = useProjectSync({
    projectId: id,
    enabled: supabaseEnabled,
  })

  const navItems = [
    { href: `/project/${id}/editor`, label: 'Script', icon: '📝' },
    { href: `/project/${id}/media`, label: 'Media', icon: '🎬' },
    { href: `/project/${id}/render`, label: 'Render', icon: '🎞️' },
  ]

  return (
    <div className="bg-omega-panel border-b border-omega-border">
      <div className="flex items-center gap-6 px-6">
        <Logo size="sm" showText={false} className="flex-shrink-0" />
        <div className="flex items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all relative ${
                  isActive
                    ? 'text-omega-accent border-b-2 border-omega-accent'
                    : 'text-omega-text/60 hover:text-omega-text'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="flex-shrink-0">
          <PersistenceStatus
            enabled={supabaseEnabled}
            isInitialLoad={isInitialLoad}
            isSaving={isSaving}
            lastSaved={lastSaved}
            showMock={!supabaseEnabled} // Show mock animation when not configured
          />
        </div>
      </div>
    </div>
  )
}

