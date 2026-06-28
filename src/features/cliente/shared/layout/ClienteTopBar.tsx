'use client'

import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, User, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn, getInitials, fileUrl } from '@/lib/utils'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { clienteService } from '@/services/cliente.service'
import { NotificacionesPanel } from '@/features/cliente/shared/components/NotificacionesPanel'
import { clienteKeys } from '@/features/cliente/shared/queryKeys'

const BREADCRUMB_MAP: Record<string, string> = {
  cliente: 'Inicio',
  'mis-reservas': 'Mis reservas',
  'mis-eventos': 'Mis eventos',
  'mi-cuenta': 'Mi cuenta',
  beneficios: 'Beneficios',
  ayuda: 'Ayuda',
}

function getBreadcrumb(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let path = ''
  for (const seg of segments) {
    path += `/${seg}`
    const label = BREADCRUMB_MAP[seg]
    if (label) crumbs.push({ label, href: path })
    else if (/^\d+$/.test(seg) && crumbs.length > 0) {
      crumbs.push({ label: 'Detalle', href: path })
    }
  }
  return crumbs
}

export function ClienteTopBar() {
  const pathname = usePathname()
  const { nombre, correo, clientePerfilId, logout } = useAuth()
  const breadcrumb = getBreadcrumb(pathname)

  const { data: perfil } = useQuery({
    queryKey: clienteKeys.perfil(clientePerfilId),
    queryFn: () => clienteService.obtener(clientePerfilId!),
    enabled: !!clientePerfilId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const fotoUrl = fileUrl(perfil?.fotoPerfilPath)
  const nombreMostrar =
    perfil?.nombreCompleto || nombre || correo?.split('@')[0] || ''
  const nombreCorto =
    perfil?.nombres?.split(' ')[0] ||
    nombre?.split(' ')[0] ||
    correo?.split('@')[0] ||
    ''

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex items-center px-4 lg:px-6 gap-3">
      <div className="lg:hidden shrink-0">
        <Logo variant="secundario" size="sm" href="/cliente" />
      </div>

      <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0">
        {breadcrumb.map((crumb, i) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0 mx-0.5" />
            )}
            {i === breadcrumb.length - 1 ? (
              <span className="text-sm font-bold text-gray-900">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <span className="lg:hidden text-sm font-bold text-gray-900 flex-1 truncate">
        {breadcrumb.at(-1)?.label ?? 'Mi área'}
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <NotificacionesPanel />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'h-9 flex items-center gap-2 px-2 rounded-xl hover:bg-gray-100 transition-colors',
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
                <AvatarFallback className="text-[11px] font-bold text-white bg-brand-rosa">
                  {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[110px] truncate">
                {nombreCorto}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 rounded-2xl p-1.5 shadow-xl border border-gray-100"
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
                <AvatarFallback className="text-xs font-bold text-white bg-brand-rosa">
                  {nombreMostrar ? getInitials(nombreMostrar) : 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {nombreMostrar}
                </p>
                <p className="text-xs text-gray-400 truncate">{correo}</p>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/cliente/mi-cuenta"
                className="gap-2.5 rounded-xl cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-azul/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-brand-azul" />
                </div>
                Mi perfil
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/cliente/mi-cuenta"
                className="gap-2.5 rounded-xl cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Settings className="h-3.5 w-3.5 text-gray-500" />
                </div>
                Configuración
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="gap-2.5 rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                <LogOut className="h-3.5 w-3.5 text-red-500" />
              </div>
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
