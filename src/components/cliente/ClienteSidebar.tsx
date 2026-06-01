'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  CalendarDays,
  PartyPopper,
  User,
  Star,
  HelpCircle,
  LogOut,
  Globe,
  Heart,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Logo } from '@/components/brand/Logo'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import { cn, getInitials, fileUrl } from '@/lib/utils'
import { clienteService } from '@/services/cliente.service'

const WHATSAPP_URL = 'https://wa.me/51987654321'

const mainNav = [
  { href: '/cliente',              label: 'Inicio',       icon: LayoutDashboard, exact: true },
  { href: '/cliente/mis-reservas', label: 'Mis reservas', icon: CalendarDays },
  { href: '/cliente/mis-eventos',  label: 'Mis eventos',  icon: PartyPopper },
  { href: '/cliente/mi-cuenta',    label: 'Mi cuenta',    icon: User },
  { href: '/cliente/beneficios',   label: 'Beneficios',   icon: Star },
]

export function ClienteSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { data: session } = useSession()
  const userId = parseInt(session?.user?.id ?? '0')

  const { data: perfil } = useQuery({
    queryKey: ['cliente-perfil', userId],
    queryFn: () => clienteService.obtener(userId),
    enabled: !!userId && userId > 0,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const fotoUrl = fileUrl(perfil?.fotoPerfil)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100/80">
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <Logo variant="secundario" size="md" href="/cliente" />
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mt-2 ml-0.5">
          Portal del Cliente
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-3 mb-2.5">
          Navegación
        </p>

        {mainNav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150',
                active
                  ? 'bg-brand-azul/10 text-brand-azul font-semibold shadow-sm'
                  : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                  active
                    ? 'bg-brand-azul/15 text-brand-azul'
                    : 'text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100'
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

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100 transition-colors">
            <HelpCircle className="h-4 w-4" />
          </div>
          <span className="flex-1">Ayuda</span>
        </a>
      </nav>

      <div className="px-3 pb-4">
        <Separator className="mb-3" />
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 px-3 mb-2.5">
          General
        </p>
        <div className="space-y-0.5">
          <Link
            href="/"
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-100 transition-colors">
              <Globe className="h-4 w-4" />
            </div>
            Ir al sitio
          </Link>
          <button
            onClick={logout}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-gray-400 group-hover:text-red-400 group-hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" />
            </div>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 border-t border-gray-100">
        <Link
          href="/cliente/mi-cuenta"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group mt-3"
        >
          <Avatar className="h-9 w-9 shrink-0">
            {fotoUrl && (
              <AvatarImage src={fotoUrl} alt={user?.name ?? ''} className="object-cover" />
            )}
            <AvatarFallback className="text-xs bg-brand-rosa text-white font-bold">
              {user?.name ? getInitials(user.name) : 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-brand-azul transition-colors leading-tight">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate leading-tight mt-0.5">{user?.email}</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0 group-hover:text-brand-azul transition-colors" />
        </Link>
      </div>

      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Heart className="h-3 w-3 text-brand-rosa fill-brand-rosa shrink-0" />
          <p className="text-xs font-bold text-gray-700">Kiki y Lala Eventos</p>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Creando momentos mágicos para cada celebración.
        </p>
        <p className="text-[10px] text-gray-300 mt-1.5 font-mono tracking-wide">v 1.0.0</p>
      </div>
    </aside>
  )
}
