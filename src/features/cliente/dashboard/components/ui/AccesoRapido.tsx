'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AccesoRapidoProps {
  href: string
  icon: React.ElementType
  label: string
  color: string
}

export function AccesoRapido({ href, icon: Icon, label, color }: AccesoRapidoProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all hover:translate-x-0.5 duration-200"
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </Link>
  )
}
