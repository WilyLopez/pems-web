'use client'

import { memo, useState, useRef, useEffect } from 'react'
import {
  Bell,
  LogOut,
  Menu,
  User,
  Settings,
  Shield,
  KeyRound,
  Search,
  LayoutDashboard,
  X,
  ExternalLink,
  SlidersHorizontal,
  HelpCircle,
  Check,
  ShoppingBag,
  Ticket,
  PartyPopper,
  Wallet,
  FileText,
  Info,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { useNotificaciones } from '@/hooks/useNotificaciones'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { useNotificacionesStore } from '@/lib/store/notificaciones.store'
import type { TipoVisual } from '@/types/notificaciones.types'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/DropdownMenu'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { cn, getInitials } from '@/lib/utils'
import Link from 'next/link'

/* ─── Buscador global ────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  { label: 'Nueva reserva', href: '/admin/reservas', icon: LayoutDashboard },
  {
    label: 'Ver calendario',
    href: '/admin/calendario',
    icon: LayoutDashboard,
  },
  { label: 'Clientes', href: '/admin/clientes', icon: User },
  {
    label: 'Reportes',
    href: '/admin/finanzas/reportes',
    icon: LayoutDashboard,
  },
]

function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm text-gray-400 hover:border-brand-azul/40 hover:bg-white hover:text-gray-600 transition-all w-52 lg:w-72"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 text-left text-xs">Buscar...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-gray-200 bg-white px-1.5 text-[10px] font-medium text-gray-400">
          Ctrl K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden h-9 w-9 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg top-[15%] translate-y-0">
          <DialogTitle className="sr-only">Buscador Global</DialogTitle>
          <div className="w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar reservas, clientes, eventos, pagos..."
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')}>
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="p-3">
              <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Accesos rapidos
              </p>
              <div className="space-y-0.5">
                {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => {
                      setOpen(false)
                      setQuery('')
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-brand-azul/8 hover:text-brand-azul transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-brand-azul/15 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-gray-500 group-hover:text-brand-azul" />
                    </div>
                    {label}
                    <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-[10px] text-gray-400">
              <span>
                <kbd className="border rounded px-1">↑↓</kbd> Navegar
              </span>
              <span>
                <kbd className="border rounded px-1">↵</kbd> Abrir
              </span>
              <span>
                <kbd className="border rounded px-1">Esc</kbd> Cerrar
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ─── Notificaciones ─────────────────────────────────────────────────────────── */

const TIPO_ICON: Record<TipoVisual, LucideIcon> = {
  reserva:  Ticket,
  evento:   PartyPopper,
  pago:     Wallet,
  contrato: FileText,
  caja:     ShoppingBag,
  sistema:  Info,
}

const TIPO_BADGE: Record<TipoVisual, string> = {
  reserva:  'bg-brand-azul/10 text-brand-azul',
  evento:   'bg-brand-rosa/10 text-brand-rosa',
  pago:     'bg-amber-50 text-amber-600',
  contrato: 'bg-green-50 text-green-600',
  caja:     'bg-orange-50 text-orange-600',
  sistema:  'bg-gray-100 text-gray-500',
}

const DOT_COLOR: Record<TipoVisual, string> = {
  reserva:  'bg-brand-azul',
  evento:   'bg-brand-rosa',
  pago:     'bg-amber-500',
  contrato: 'bg-green-500',
  caja:     'bg-orange-500',
  sistema:  'bg-gray-400',
}

const NotificacionesMenu = memo(function NotificacionesMenu() {
  const { notificaciones, noLeidas, fetchNotificaciones, marcarLeida, marcarTodasLeidas } =
    useNotificacionesStore()

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchNotificaciones() }}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-[18px] w-[18px] text-gray-500" />
          {noLeidas > 0 && (
            <span className="absolute top-1.5 right-1.5 h-[7px] w-[7px] rounded-full bg-brand-rosa ring-2 ring-white" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 rounded-2xl overflow-hidden shadow-card-hover"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-bold text-sm text-gray-900">Notificaciones</span>
          {noLeidas > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-brand-rosa text-white text-[10px] h-5 px-2 rounded-full">
                {noLeidas} nuevas
              </Badge>
              <button
                onClick={marcarTodasLeidas}
                className="flex items-center gap-1 text-[10px] font-semibold text-brand-azul hover:text-brand-azul/70 transition-colors"
              >
                <Check className="h-3 w-3" />
                Marcar todas
              </button>
            </div>
          )}
        </div>

        <div className="max-h-[340px] overflow-y-auto divide-y divide-gray-50">
          {notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Bell className="h-5 w-5 text-gray-300" />
              <p className="text-xs text-gray-400">Sin notificaciones</p>
            </div>
          ) : (
            notificaciones.map((n) => {
              const Icon = TIPO_ICON[n.tipo]
              return (
                <div
                  key={n.id}
                  onClick={() => marcarLeida(n.id)}
                  className={cn(
                    'flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                    !n.leida && 'bg-brand-azul/[0.03]'
                  )}
                >
                  <div className={cn('mt-0.5 h-2 w-2 rounded-full shrink-0 mt-2',
                    !n.leida ? DOT_COLOR[n.tipo] : 'bg-transparent'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs leading-snug',
                      n.leida ? 'text-gray-600' : 'text-gray-900 font-semibold'
                    )}>
                      {n.titulo}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{n.mensaje}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {formatDistanceToNow(n.fecha, { addSuffix: true, locale: es })}
                      </span>
                      <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', TIPO_BADGE[n.tipo])}>
                        {n.tipo}
                      </span>
                    </div>
                  </div>
                  <Icon className={cn('h-3.5 w-3.5 shrink-0 mt-1', TIPO_BADGE[n.tipo].split(' ')[1])} />
                </div>
              )
            })
          )}
        </div>

        <div className="p-2 border-t border-gray-100">
          <Link
            href="/admin/notificaciones"
            className="block w-full text-center text-xs text-brand-azul font-semibold py-2 rounded-xl hover:bg-brand-azul/8 transition-colors"
          >
            Ver todas las notificaciones
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})


export function AdminNavbar() {
  const { nombre, correo, logout } = useAuth()
  const { toggleMobile } = useSidebarStore()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 px-4 sm:px-6 glass border-b border-gray-100">
      {/* Boton hamburguesa mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobile}
        className="lg:hidden h-9 w-9 rounded-xl hover:bg-gray-100"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </Button>

      {/* Acciones derecha */}
      <div className="flex items-center gap-1.5 ml-auto flex-1 justify-end">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8 transition-colors"
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Ver sitio
          </Link>
        </Button>

        <GlobalSearch />
        <NotificacionesMenu />

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Menu de perfil */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-9 px-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs bg-brand-azul text-white font-black">
                  {nombre ? getInitials(nombre) : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-none">
                  {nombre?.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                  Administrador
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-60 rounded-2xl p-1.5 shadow-card-hover"
          >
            {/* Info del usuario */}
            <div className="px-3 py-2.5 mb-1">
              <p className="text-sm font-bold text-gray-900">{nombre}</p>
              <p className="text-xs text-gray-400 truncate">{correo}</p>
            </div>

            <Separator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/perfil"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Mi perfil</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/configuracion"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Settings className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Configuracion</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/preferencias"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Preferencias</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <Separator className="my-1" />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/perfil#seguridad"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Shield className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Seguridad</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/perfil#contrasena"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <KeyRound className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Cambiar contrasena</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/admin/soporte"
                  className="flex items-center gap-2.5 rounded-xl cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <span className="text-sm">Soporte</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <Separator className="my-1" />

            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2.5 rounded-xl cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/8"
            >
              <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-3.5 w-3.5 text-destructive" />
              </div>
              <span className="text-sm font-medium">Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
