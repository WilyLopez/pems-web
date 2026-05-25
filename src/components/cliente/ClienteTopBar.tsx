'use client'

import { usePathname } from 'next/navigation'
import { Globe, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn, getInitials } from '@/lib/utils'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const SECTION_LABELS: Record<string, string> = {
  '/cliente': 'Inicio',
  '/cliente/mis-reservas': 'Mis reservas',
  '/cliente/mis-eventos': 'Mis eventos',
  '/cliente/mi-cuenta': 'Mi cuenta',
}

function getSectionLabel(pathname: string): string {
  if (SECTION_LABELS[pathname]) return SECTION_LABELS[pathname]
  for (const [prefix, label] of Object.entries(SECTION_LABELS)) {
    if (pathname.startsWith(prefix + '/')) return label
  }
  return 'Mi área'
}

export function ClienteTopBar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-4">
      <div className="lg:hidden shrink-0">
        <Logo variant="secundario" size="sm" href="/" />
      </div>

      <span className="hidden lg:block text-sm font-bold text-gray-700">
        {getSectionLabel(pathname)}
      </span>

      <div className="flex-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback
                className={cn(
                  'text-xs font-bold text-white',
                  'bg-brand-rosa'
                )}
              >
                {user?.name ? getInitials(user.name) : 'C'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
    </header>
  )
}
