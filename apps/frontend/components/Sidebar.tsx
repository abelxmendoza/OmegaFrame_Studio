'use client'

import Link from 'next/link'
import Logo from './Logo'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-omega-panel border-r border-omega-border p-6 space-y-6 flex-shrink-0">
      <Logo size="sm" />

      <nav className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="text-omega-text/70 hover:text-omega-accent transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/settings"
          className="text-omega-text/70 hover:text-omega-accent transition-colors"
        >
          Settings
        </Link>
      </nav>
    </aside>
  )
}

