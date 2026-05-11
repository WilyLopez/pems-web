// components/layout/ClienteNavbar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ticket, CalendarDays, PartyPopper, User, LogOut, Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn, getInitials } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const navLinks = [
  { href: '/cliente/mis-entradas', label: 'Mis entradas', icon: Ticket      },
  { href: '/cliente/mis-reservas', label: 'Mis reservas', icon: CalendarDays },
  { href: '/cliente/mis-eventos',  label: 'Mis eventos',  icon: PartyPopper  },
  { href: '/cliente/mi-cuenta',    label: 'Mi cuenta',    icon: User         },
]

export function ClienteNavbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo variant="secundario" size="sm" href="/" />

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                pathname === href
                  ? 'bg-brand-azul/10 text-brand-azul'
                  : 'text-gray-600 hover:text-brand-azul hover:bg-brand-azul/8',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 px-3 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-brand-rosa text-white font-bold">
                    {user?.name ? getInitials(user.name) : 'C'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-semibold">
                  {user?.name?.split(' ')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-3 py-2">
                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Ir al sitio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive gap-2"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold',
                pathname === href
                  ? 'bg-brand-azul/10 text-brand-azul'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}