'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Ticket, PartyPopper, Tag, Mail, Users, Globe,
  ClipboardList, UserCog, ChevronLeft, ChevronDown, ScanLine, DoorOpen,
  TrendingUp, ArrowDownCircle, ArrowUpCircle, BarChart3, Landmark,
  HeadphonesIcon, Settings, Package2, MapPin, Zap, Newspaper, DollarSign,
  LayoutGrid, PanelLeftClose, PanelLeftOpen, MailOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { Logo } from '@/components/brand/Logo'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'
import type { LucideIcon } from 'lucide-react'

const navGroups: {
  label: string
  items: { label: string; href: string; icon: LucideIcon; exact?: boolean }[]
}[] = [
  {
    label: 'Principal',
    items: [
      { label: 'Dashboard',   href: '/admin/dashboard',  icon: LayoutDashboard },
      { label: 'Calendario',  href: '/admin/calendario', icon: Calendar },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { label: 'Reservas públicas',  href: '/admin/reservas',          icon: Ticket },
      { label: 'Eventos privados',   href: '/admin/eventos',           icon: PartyPopper },
      { label: 'Control de acceso',  href: '/admin/accesos/entradas',  icon: ScanLine },
      { label: 'Ingreso a eventos',  href: '/admin/accesos/eventos',   icon: DoorOpen },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { label: 'Resumen',   href: '/admin/finanzas',          icon: TrendingUp,     exact: true },
      { label: 'Ingresos',  href: '/admin/finanzas/ingresos', icon: ArrowUpCircle },
      { label: 'Egresos',   href: '/admin/finanzas/egresos',  icon: ArrowDownCircle },
      { label: 'Caja',      href: '/admin/finanzas/caja',     icon: Landmark },
      { label: 'Reportes',  href: '/admin/finanzas/reportes', icon: BarChart3 },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Paquetes',             href: '/admin/comercial/paquetes',   icon: Package2 },
      { label: 'Servicios cotización', href: '/admin/comercial/servicios',  icon: LayoutGrid },
      { label: 'Promociones',          href: '/admin/promociones',          icon: Tag },
      { label: 'Tarifas',              href: '/admin/catalogo/tarifas',     icon: DollarSign },
    ],
  },
  {
    label: 'Sitio web',
    items: [
      { label: 'Zonas de juego', href: '/admin/comercial/zonas',      icon: MapPin },
      { label: 'Actividades',    href: '/admin/comercial/actividades', icon: Zap },
      { label: 'Novedades',      href: '/admin/comercial/novedades',  icon: Newspaper },
      { label: 'CMS',            href: '/admin/cms',                  icon: Globe },
    ],
  },
  {
    label: 'Clientes y marketing',
    items: [
      { label: 'Clientes',   href: '/admin/clientes',          icon: Users },
      { label: 'Marketing',  href: '/admin/marketing',         icon: Mail,     exact: true },
      { label: 'Correos',    href: '/admin/marketing/correos', icon: MailOpen },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { label: 'Usuarios',       href: '/admin/usuarios',      icon: UserCog },
      { label: 'Auditoría',      href: '/admin/auditoria',     icon: ClipboardList },
      { label: 'Configuración',  href: '/admin/configuracion', icon: Settings },
      { label: 'Soporte',        href: '/admin/soporte',       icon: HeadphonesIcon },
    ],
  },
]

interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  collapsed: boolean
  onClick?: () => void
}

function NavItem({ href, label, icon: Icon, active, collapsed, onClick }: NavItemProps) {
  const link = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-brand-azul text-white shadow-brand'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
        collapsed && 'justify-center px-0'
      )}
    >
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0',
          active ? 'text-white' : 'text-gray-400 group-hover:text-gray-700'
        )}
      />
      {!collapsed && <span className="truncate leading-none">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

interface NavGroupProps {
  label: string
  items: { label: string; href: string; icon: LucideIcon; exact?: boolean }[]
  collapsed: boolean
  isActive: (href: string, exact?: boolean) => boolean
  onItemClick?: () => void
}

function NavGroup({ label, items, collapsed, isActive, onItemClick }: NavGroupProps) {
  const hasActive = items.some(({ href, exact }) => isActive(href, exact))
  const [open, setOpen] = useState(true)

  if (collapsed) {
    return (
      <div className="space-y-0.5">
        {items.map(({ label: l, href, icon, exact }) => (
          <NavItem key={href} href={href} label={l} icon={icon} active={isActive(href, exact)} collapsed />
        ))}
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className={cn(
          'group mb-0.5 flex w-full items-center justify-between rounded-md px-2.5 py-1.5',
          'text-left transition-colors hover:bg-gray-50',
        )}
      >
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-widest select-none transition-colors',
          hasActive ? 'text-brand-azul' : 'text-gray-400 group-hover:text-gray-500',
        )}>
          {label}
        </span>
        <ChevronDown className={cn(
          'h-3 w-3 text-gray-300 transition-transform duration-200',
          !open && '-rotate-90',
        )} />
      </button>

      <div className={cn(
        'space-y-0.5 overflow-hidden transition-all duration-200 ease-in-out',
        open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
      )}>
        {items.map(({ label: l, href, icon, exact }) => (
          <NavItem
            key={href}
            href={href}
            label={l}
            icon={icon}
            active={isActive(href, exact)}
            collapsed={false}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  )
}

function SidebarContent({
  collapsed,
  isActive,
  onItemClick,
}: {
  collapsed: boolean
  isActive: (href: string, exact?: boolean) => boolean
  onItemClick?: () => void
}) {
  return (
    <ScrollArea className="flex-1">
      <nav className={cn('py-3 space-y-4', collapsed ? 'px-1.5' : 'px-3')}>
        {navGroups.map(group => (
          <NavGroup
            key={group.label}
            label={group.label}
            items={group.items}
            collapsed={collapsed}
            isActive={isActive}
            onItemClick={onItemClick}
          />
        ))}
      </nav>
    </ScrollArea>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle, close } = useSidebarStore()

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const collapsed = !isOpen

  return (
    <TooltipProvider delayDuration={100}>

      {/* ── Backdrop móvil ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={close}
        />
      )}

      {/* ── Drawer móvil ───────────────────────────────────────────────────── */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 shadow-card-hover',
        'w-[240px] transition-transform duration-300 ease-in-out',
        'lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="flex h-[72px] shrink-0 items-center border-b border-gray-100 px-5">
          <Logo variant="secundario" size="md" href="/admin/dashboard" />
        </div>

        <SidebarContent collapsed={false} isActive={isActive} onItemClick={close} />

        <div className="shrink-0 border-t border-gray-100 px-5 py-4">
          <p className="text-[11px] font-semibold text-gray-600 leading-none">Kiki y Lala Admin</p>
          <p className="text-[10px] text-gray-400 mt-1">v1.0.0</p>
        </div>
      </aside>

      {/* ── Sidebar de escritorio ───────────────────────────────────────────── */}
      <aside className={cn(
        'relative hidden lg:flex flex-col bg-white border-r border-gray-100',
        'transition-[width] duration-300 ease-in-out shrink-0',
        collapsed ? 'w-[64px]' : 'w-[240px]',
      )}>
        {/* Logo */}
        <div className={cn(
          'flex h-[72px] shrink-0 items-center border-b border-gray-100 overflow-hidden',
          'transition-all duration-300',
          collapsed ? 'justify-center px-0' : 'px-5',
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/admin/dashboard">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-azul to-[#0090cc] flex items-center justify-center shadow-brand shrink-0">
                    <span className="text-white font-black text-sm">K</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
                Kiki y Lala Admin
              </TooltipContent>
            </Tooltip>
          ) : (
            <Logo variant="secundario" size="md" href="/admin/dashboard" />
          )}
        </div>

        {/* Navegación */}
        <SidebarContent collapsed={collapsed} isActive={isActive} />

        {/* Footer */}
        <div className={cn(
          'shrink-0 border-t border-gray-100',
          collapsed ? 'flex justify-center py-4' : 'px-5 py-4',
        )}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[9px] font-bold text-gray-400 select-none cursor-default">v1</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">Kiki y Lala Admin v1.0.0</TooltipContent>
            </Tooltip>
          ) : (
            <div>
              <p className="text-[11px] font-semibold text-gray-600 leading-none">Kiki y Lala Admin</p>
              <p className="text-[10px] text-gray-400 mt-1">v1.0.0</p>
            </div>
          )}
        </div>

        {/* Botón colapsar */}
        <button
          onClick={toggle}
          className={cn(
            'absolute -right-3.5 top-[84px] z-10',
            'h-7 w-7 rounded-full flex items-center justify-center',
            'border border-gray-200 bg-white shadow-card',
            'text-gray-400 hover:text-brand-azul hover:border-brand-azul/40 hover:shadow-brand',
            'transition-all duration-200',
          )}
        >
          {collapsed
            ? <PanelLeftOpen className="h-3.5 w-3.5" />
            : <PanelLeftClose className="h-3.5 w-3.5" />
          }
        </button>
      </aside>
    </TooltipProvider>
  )
}
