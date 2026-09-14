'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wallet,
  ShoppingCart,
  CalendarDays,
  Calendar,
  Users,
  ScanLine,
  LogOut,
  Globe,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import { cn, getInitials, fileUrl } from '@/lib/utils'

const mainNav = [
  { href: '/cajero/caja', label: 'Caja', icon: Wallet },
  { href: '/cajero/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/cajero/reservas', label: 'Reservas', icon: CalendarDays },
  { href: '/cajero/clientes', label: 'Clientes', icon: Users },
  { href: '/cajero/accesos', label: 'Accesos', icon: ScanLine },
  { href: '/cajero/calendario', label: 'Calendario', icon: Calendar },
]

export function CajeroSidebar() {
  const pathname = usePathname()
  const { nombre, correo, fotoPerfilUrl, logout } = useAuth()

  const fotoUrl = fileUrl(fotoPerfilUrl)
  const nombreMostrar = nombre || correo?.split('@')[0] || ''

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-gray-900 border-r border-gray-100/80 dark:border-gray-800">
      <div className="px-5 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800">
        <Logo variant="secundario" size="md" href="/cajero" />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 mt-2 ml-0.5">
          Panel de Cajero
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 px-3 mb-2.5">
          Navegación
        </p>

        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-brand-azul/10 dark:bg-brand-azul/20 text-brand-azul font-semibold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  active
                    ? 'bg-brand-azul/15 dark:bg-brand-azul/25 text-brand-azul'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1">{label}</span>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-azul shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-3" />
        <div className="space-y-0.5">
          <Link
            href="/"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
              <Globe className="h-4 w-4" />
            </div>
            Ir al sitio
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-red-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 flex items-center gap-2.5">
        <Avatar className="h-9 w-9 shrink-0">
          {fotoUrl && (
            <AvatarImage
              src={fotoUrl}
              alt={nombreMostrar}
              className="object-cover"
            />
          )}
          <AvatarFallback className="text-xs font-bold text-white bg-brand-azul">
            {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
            {nombreMostrar}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
            {correo}
          </p>
        </div>
      </div>
    </aside>
  )
}
