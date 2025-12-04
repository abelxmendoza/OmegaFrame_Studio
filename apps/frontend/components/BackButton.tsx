'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
}

export default function BackButton({ href, label = 'Back' }: BackButtonProps) {
  const router = useRouter()

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-omega-text/70 hover:text-omega-accent transition-colors text-sm font-medium"
      >
        <span>←</span>
        <span>{label}</span>
      </Link>
    )
  }

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-omega-text/70 hover:text-omega-accent transition-colors text-sm font-medium"
    >
      <span>←</span>
      <span>{label}</span>
    </button>
  )
}

