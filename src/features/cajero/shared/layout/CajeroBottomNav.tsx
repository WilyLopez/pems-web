'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, ShoppingCart, CalendarDays, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/cajero/caja', label: 'Caja', icon: Wallet },
  { href: '/cajero/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/cajero/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/cajero/clientes', label: 'Clientes', icon: Users },
]

export function CajeroBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 safe-area-pb">
      <div className="grid grid-cols-4 h-16">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-150',
                active
                  ? 'text-brand-azul'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-9 h-6 rounded-lg flex items-center justify-center transition-all duration-150',
                  active ? 'bg-brand-azul/10 dark:bg-brand-azul/20' : ''
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
