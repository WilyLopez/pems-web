'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  PartyPopper,
  Star,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/cliente', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/cliente/mis-reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/cliente/mis-eventos', label: 'Eventos', icon: PartyPopper },
  { href: '/cliente/beneficios', label: 'Beneficios', icon: Star },
  { href: '/cliente/ayuda', label: 'Ayuda', icon: HelpCircle },
]

export function ClienteBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-150',
                active ? 'text-brand-azul' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div
                className={cn(
                  'w-9 h-6 rounded-lg flex items-center justify-center transition-all duration-150',
                  active ? 'bg-brand-azul/10' : ''
                )}
              >
                <Icon
                  className={cn('h-5 w-5', active ? 'text-brand-azul' : '')}
                />
              </div>
              <span className={cn(active ? 'text-brand-azul' : '')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
