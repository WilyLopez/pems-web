'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Check,
  ExternalLink,
  FileText,
  Info,
  PartyPopper,
  RefreshCw,
  ShoppingBag,
  Ticket,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useNotificacionesStore } from '@/lib/store/notificaciones.store'
import type { Notificacion } from '@/lib/store/notificaciones.store'
import type { TipoVisual } from '@/types/notificaciones.types'

type Filtro = 'todas' | 'no-leidas' | TipoVisual

const TIPO_ICON: Record<TipoVisual, LucideIcon> = {
  reserva: Ticket,
  evento: PartyPopper,
  pago: Wallet,
  contrato: FileText,
  caja: ShoppingBag,
  sistema: Info,
}

const TIPO_COLOR: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul/10 text-brand-azul',
  evento: 'bg-brand-rosa/10 text-brand-rosa',
  pago: 'bg-amber-50 text-amber-600',
  contrato: 'bg-green-50 text-green-600',
  caja: 'bg-orange-50 text-orange-600',
  sistema: 'bg-gray-100 text-gray-500',
}

const DOT_COLOR: Record<TipoVisual, string> = {
  reserva: 'bg-brand-azul',
  evento: 'bg-brand-rosa',
  pago: 'bg-amber-500',
  contrato: 'bg-green-500',
  caja: 'bg-orange-500',
  sistema: 'bg-gray-400',
}

const TIPO_LABEL: Record<TipoVisual, string> = {
  reserva: 'Reservas',
  evento: 'Eventos',
  pago: 'Pagos',
  contrato: 'Contratos',
  caja: 'Caja',
  sistema: 'Sistema',
}

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'no-leidas', label: 'No leídas' },
  { value: 'reserva', label: 'Reservas' },
  { value: 'pago', label: 'Pagos' },
  { value: 'evento', label: 'Eventos' },
  { value: 'contrato', label: 'Contratos' },
  { value: 'caja', label: 'Caja' },
  { value: 'sistema', label: 'Sistema' },
]

interface NotificacionItemProps {
  n: Notificacion
  onRead: (id: string) => void
}

function NotificacionItem({ n, onRead }: NotificacionItemProps) {
  const Icon = TIPO_ICON[n.tipo]

  return (
    <div
      onClick={() => !n.leida && onRead(n.id)}
      className={cn(
        'flex gap-3 px-5 py-4 transition-colors',
        !n.leida
          ? 'bg-brand-azul/[0.03] hover:bg-brand-azul/[0.06] cursor-pointer'
          : 'hover:bg-gray-50'
      )}
    >
      <div className="relative shrink-0 mt-0.5">
        <div
          className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            TIPO_COLOR[n.tipo]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!n.leida && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white',
              DOT_COLOR[n.tipo]
            )}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-snug',
            n.leida ? 'text-gray-600' : 'text-gray-900 font-semibold'
          )}
        >
          {n.titulo}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.mensaje}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400">
            {formatDistanceToNow(n.fecha, { addSuffix: true, locale: es })}
          </span>
          <span
            className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
              TIPO_COLOR[n.tipo]
            )}
          >
            {TIPO_LABEL[n.tipo]}
          </span>
        </div>
      </div>

      {n.href && (
        <a
          href={n.href}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-1 text-gray-300 hover:text-brand-azul transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

export function NotificacionesSheet() {
  const {
    notificaciones,
    noLeidas,
    cargando,
    panelAbierto,
    setPanelAbierto,
    fetchNotificaciones,
    marcarLeida,
    marcarTodasLeidas,
  } = useNotificacionesStore()

  const [filtro, setFiltro] = useState<Filtro>('todas')
  const pathname = usePathname()

  useEffect(() => {
    setPanelAbierto(false)
  }, [pathname])

  const filtradas = useMemo(() => {
    if (filtro === 'no-leidas') return notificaciones.filter((n) => !n.leida)
    if (filtro === 'todas') return notificaciones
    return notificaciones.filter((n) => n.tipo === filtro)
  }, [notificaciones, filtro])

  const handleOpenChange = (open: boolean) => {
    setPanelAbierto(open)
    if (open) fetchNotificaciones()
  }

  return (
    <Sheet open={panelAbierto} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="shrink-0">
          <SheetTitle>Notificaciones</SheetTitle>
          <div className="flex items-center gap-2">
            {noLeidas > 0 && (
              <>
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
              </>
            )}
            <SheetCloseButton />
          </div>
        </SheetHeader>

        <div className="flex gap-1.5 px-4 py-2.5 border-b border-gray-100 overflow-x-auto shrink-0 scrollbar-none">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={cn(
                'shrink-0 rounded-full text-[11px] font-semibold px-3 py-1 transition-colors',
                filtro === f.value
                  ? 'bg-brand-azul text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0">
          {cargando && notificaciones.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-5 w-5 text-gray-300 animate-spin" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Bell className="h-8 w-8 text-gray-200" />
              <p className="text-sm text-gray-400">
                {filtro === 'no-leidas'
                  ? 'No tienes notificaciones sin leer.'
                  : 'Sin notificaciones.'}
              </p>
            </div>
          ) : (
            filtradas.map((n) => (
              <NotificacionItem key={n.id} n={n} onRead={marcarLeida} />
            ))
          )}
        </div>

        <div className="border-t border-gray-100 px-4 py-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotificaciones}
            disabled={cargando}
            className="w-full"
          >
            <RefreshCw
              className={cn('mr-2 h-3.5 w-3.5', cargando && 'animate-spin')}
            />
            Actualizar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
