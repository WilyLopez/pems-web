// components/layout/AdminSidebar.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  PartyPopper,
  FileText,
  CreditCard,
  Receipt,
  Tag,
  Users,
  Globe,
  ClipboardList,
  UserCog,
  ChevronLeft,
  ChevronDown,
  ScanLine,
  DoorOpen,
  TrendingUp,
  ArrowDownCircle,
  BarChart3,
  HeadphonesIcon,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'

/* ─── Estructura de navegacion agrupada ─────────────────────────────────────── */

const navGroups = [
  {
    label: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Calendario',
        href: '/admin/calendario',
        icon: Calendar,
      },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      {
        label: 'Reservas Públicas',
        href: '/admin/reservas',
        icon: Ticket,
      },
      {
        label: 'Eventos Privados',
        href: '/admin/eventos',
        icon: PartyPopper,
      },
      {
        label: 'Contratos',
        href: '/admin/contratos',
        icon: FileText,
      },
    ],
  },
  {
    label: 'Clientes y Marketing',
    items: [
      {
        label: 'Clientes',
        href: '/admin/clientes',
        icon: Users,
      },
      {
        label: 'Promociones',
        href: '/admin/promociones',
        icon: Tag,
      },
    ],
  },
  {
    label: 'Accesos',
    items: [
      {
        label: 'Control de entradas',
        href: '/admin/accesos/entradas',
        icon: ScanLine,
      },
      {
        label: 'Acceso a eventos',
        href: '/admin/accesos/eventos',
        icon: DoorOpen,
      },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      {
        label: 'Ingresos',
        href: '/admin/finanzas/ingresos',
        icon: TrendingUp,
      },
      {
        label: 'Egresos',
        href: '/admin/finanzas/egresos',
        icon: ArrowDownCircle,
      },
      {
        label: 'Pagos',
        href: '/admin/pagos',
        icon: CreditCard,
      },
      {
        label: 'Comprobantes',
        href: '/admin/comprobantes',
        icon: Receipt,
      },
      {
        label: 'Reportes',
        href: '/admin/finanzas/reportes',
        icon: BarChart3,
      },
    ],
  },
  {
    label: 'Contenido Web',
    items: [
      {
        label: 'CMS',
        href: '/admin/cms',
        icon: Globe,
      },
      {
        label: 'Auditoría',
        href: '/admin/auditoria',
        icon: ClipboardList,
      },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Usuarios Admin',
        href: '/admin/usuarios',
        icon: UserCog,
      },
      {
        label: 'Configuración',
        href: '/admin/configuracion',
        icon: Settings,
      },
      {
        label: 'Soporte',
        href: '/admin/soporte',
        icon: HeadphonesIcon,
      },
    ],
  },
]

/*
  Modulos comentados — proxima fase:
  { label: 'Inventario', href: '/admin/inventario', icon: Package     },
  { label: 'Ventas',     href: '/admin/ventas',     icon: ShoppingCart},
  { label: 'Proveedores',href: '/admin/proveedores',icon: Truck       },
*/

/* ─── Componente item de navegacion ─────────────────────────────────────────── */

interface NavItemProps {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  collapsed: boolean
}

function NavItem({ href, label, icon: Icon, active, collapsed }: NavItemProps) {
  const link = (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150',
        active
          ? 'bg-brand-azul text-white shadow-brand'
          : 'text-gray-500 hover:bg-[#F8FAFC] hover:text-brand-azul',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon
        className={cn(
          'h-[17px] w-[17px] shrink-0 transition-colors',
          active ? 'text-white' : 'text-gray-400 group-hover:text-brand-azul'
        )}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

/* ─── Componente grupo colapsable ────────────────────────────────────────────── */

interface NavGroupProps {
  label: string
  items: { label: string; href: string; icon: React.ElementType }[]
  sidebarCollapsed: boolean
  isActive: (href: string) => boolean
}

function NavGroup({ label, items, sidebarCollapsed, isActive }: NavGroupProps) {
  const [open, setOpen] = useState(true)

  if (sidebarCollapsed) {
    return (
      <div>
        <div className="mx-2 mb-1 h-px bg-gray-100" />
        <div className="space-y-0.5">
          {items.map(({ label: itemLabel, href, icon }) => (
            <NavItem
              key={href}
              href={href}
              label={itemLabel}
              icon={icon}
              active={isActive(href)}
              collapsed
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="mb-1 flex w-full items-center justify-between rounded-md px-3 py-1 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
          {label}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 text-gray-300 transition-transform duration-200',
            !open && '-rotate-90'
          )}
        />
      </button>

      <div
        className={cn(
          'space-y-0.5 overflow-hidden transition-all duration-200',
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {items.map(({ label: itemLabel, href, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={itemLabel}
            icon={icon}
            active={isActive(href)}
            collapsed={false}
          />
        ))}
      </div>
    </div>
  )
}

/* ─── Sidebar ────────────────────────────────────────────────────────────────── */

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-gray-100 bg-white transition-all duration-300',
          isOpen ? 'w-[220px]' : 'w-[60px]'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-gray-100 px-3 overflow-hidden',
            isOpen ? 'justify-start' : 'justify-center'
          )}
        >
          {isOpen ? (
            <Logo variant="secundario" size="sm" href="/" />
          ) : (
            <div className="h-7 w-7 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
              <span className="text-white font-black text-xs">K</span>
            </div>
          )}
        </div>

        {/* Navegacion agrupada colapsable */}
        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-4 px-2">
            {navGroups.map((group) => (
              <NavGroup
                key={group.label}
                label={group.label}
                items={group.items}
                sidebarCollapsed={!isOpen}
                isActive={isActive}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Info del sistema */}
        <div
          className={cn(
            'shrink-0 border-t border-gray-100 px-3 py-3',
            !isOpen && 'flex justify-center'
          )}
        >
          {isOpen ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-gray-700 leading-tight">
                Kiki y Lala Admin
              </span>
              <span className="text-[10px] text-gray-400">v1.0.0</span>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[9px] font-bold text-gray-400 select-none cursor-default">
                  v1
                </span>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Kiki y Lala Admin v1.0.0
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Boton colapsar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            'absolute -right-3 top-[72px] z-10 h-6 w-6 rounded-full',
            'border border-gray-200 bg-white shadow-sm',
            'hover:bg-brand-azul hover:text-white hover:border-brand-azul',
            'transition-all duration-200',
            !isOpen && 'rotate-180'
          )}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </aside>
    </TooltipProvider>
  )
}
