'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  PartyPopper,
  User,
  LogOut,
  Globe,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn, getInitials } from '@/lib/utils'

const navLinks = [
  { href: '/cliente', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/cliente/mis-reservas', label: 'Mis reservas', icon: CalendarDays },
  { href: '/cliente/mis-eventos', label: 'Mis eventos', icon: PartyPopper },
  { href: '/cliente/mi-cuenta', label: 'Mi cuenta', icon: User },
]

export function ClienteSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100">
      <div className="px-5 py-5 border-b border-gray-100">
        <Logo variant="secundario" size="sm" href="/" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
              isActive(href, exact)
                ? 'bg-brand-azul/10 text-brand-azul'
                : 'text-gray-600 hover:text-brand-azul hover:bg-brand-azul/6'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-brand-azul hover:bg-brand-azul/6 transition-all"
        >
          <Globe className="h-4 w-4 shrink-0" />
          Ir al sitio
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>

      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-brand-rosa text-white font-bold">
            {user?.name ? getInitials(user.name) : 'C'}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
        </div>
      </div>
    </aside>
  )
}
