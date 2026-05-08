'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Ticket, PartyPopper, FileText,
  CreditCard, Receipt, Package, ShoppingCart, Tag, Users,
  Truck, Globe, ClipboardList, UserCog, ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/store/sidebar.store'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Calendario', href: '/admin/calendario', icon: Calendar },
  { label: 'Reservas', href: '/admin/reservas', icon: Ticket },
  { label: 'Eventos Privados', href: '/admin/eventos', icon: PartyPopper },
  { label: 'Contratos', href: '/admin/contratos', icon: FileText },
  { label: 'Pagos', href: '/admin/pagos', icon: CreditCard },
  { label: 'Comprobantes', href: '/admin/comprobantes', icon: Receipt },
  { label: 'Inventario', href: '/admin/inventario', icon: Package },
  { label: 'Ventas', href: '/admin/ventas', icon: ShoppingCart },
  { label: 'Promociones', href: '/admin/promociones', icon: Tag },
  { label: 'Clientes', href: '/admin/clientes', icon: Users },
  { label: 'Proveedores', href: '/admin/proveedores', icon: Truck },
  { label: 'CMS', href: '/admin/cms', icon: Globe },
  { label: 'Auditoría', href: '/admin/auditoria', icon: ClipboardList },
  { label: 'Usuarios Admin', href: '/admin/usuarios', icon: UserCog },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'relative flex flex-col border-r bg-white transition-all duration-300 shadow-sm',
        isOpen ? 'w-60' : 'w-16'
      )}>
        {/* Header */}
        <div className="flex h-16 items-center border-b px-3 overflow-hidden">
          {isOpen ? (
            <Logo variant="secundario" size="sm" href="/" className="mx-auto" />
          ) : (
            <div className="text-2xl mx-auto">🐼</div>
          )}
        </div>

        <ScrollArea className="flex-1 py-3">
          <nav className="space-y-0.5 px-2">
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href)
              const item = (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'bg-brand-azul text-white shadow-sm'
                      : 'text-gray-600 hover:bg-brand-azul/8 hover:text-brand-azul',
                    !isOpen && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {isOpen && <span>{label}</span>}
                </Link>
              )

              if (!isOpen) {
                return (
                  <Tooltip key={href}>
                    <TooltipTrigger asChild>{item}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                )
              }
              return item
            })}
          </nav>
        </ScrollArea>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            'absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-sm hover:bg-brand-azul hover:text-white hover:border-brand-azul transition-colors',
            !isOpen && 'rotate-180'
          )}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </aside>
    </TooltipProvider>
  )
}