'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, LogOut, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { NotificacionesMenu } from '@/features/admin/shared/components/NotificacionesMenu'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn, getInitials, fileUrl } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'

const BREADCRUMB_MAP: Record<string, string> = {
  cajero: 'Panel de Cajero',
  caja: 'Caja',
  ventas: 'Ventas',
  nueva: 'Nueva venta',
  reservas: 'Reservas',
  clientes: 'Clientes',
  accesos: 'Accesos',
  calendario: 'Calendario',
}

function getBreadcrumb(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let path = ''
  for (const seg of segments) {
    path += `/${seg}`
    const label = BREADCRUMB_MAP[seg]
    if (label) crumbs.push({ label, href: path })
  }
  return crumbs
}

export function CajeroTopBar() {
  const pathname = usePathname()
  const { nombre, correo, fotoPerfilUrl, logout } = useAuth()
  const { resolved, toggle } = useTheme()
  const breadcrumb = getBreadcrumb(pathname)
  useNotificaciones()

  const fotoUrl = fileUrl(fotoPerfilUrl)
  const nombreMostrar = nombre || correo?.split('@')[0] || ''
  const nombreCorto = nombre?.split(' ')[0] || correo?.split('@')[0] || ''

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex items-center px-4 lg:px-6 gap-3">
      <div className="lg:hidden shrink-0">
        <Logo variant="secundario" size="sm" href="/cajero" />
      </div>

      <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0">
        {breadcrumb.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-700 shrink-0 mx-0.5" />
            )}
            {i === breadcrumb.length - 1 ? (
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <span className="lg:hidden text-sm font-bold text-gray-900 dark:text-gray-100 flex-1 truncate">
        {breadcrumb.at(-1)?.label ?? 'Panel de Cajero'}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Cambiar tema"
          className="h-9 w-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {resolved === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <NotificacionesMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'h-9 flex items-center gap-2 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                'focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
            >
              <Avatar className="h-7 w-7">
                {fotoUrl && (
                  <AvatarImage
                    src={fotoUrl}
                    alt={nombreMostrar}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-[11px] font-bold text-white bg-brand-azul">
                  {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-[110px] truncate">
                {nombreCorto}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl p-1.5 shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <div className="px-3 py-2.5 flex items-center gap-2.5 mb-0.5">
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
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {nombreMostrar}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {correo}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="gap-2.5 rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <LogOut className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              </div>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
