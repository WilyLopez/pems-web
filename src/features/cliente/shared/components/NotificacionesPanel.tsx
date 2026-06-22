'use client'

import Link from 'next/link'
import { Bell, Ticket, PartyPopper, Wallet, FileText, Info, Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { cn } from '@/lib/utils'
import {
  useNotificacionesStore,
  Notificacion,
  TipoNotificacion,
} from '@/lib/store/notificaciones.store'
import type { LucideIcon } from 'lucide-react'

const TIPO_CONFIG: Record<TipoNotificacion, { Icon: LucideIcon; color: string; bg: string }> = {
  reserva:  { Icon: Ticket,      color: 'text-brand-azul',  bg: 'bg-brand-azul/10' },
  evento:   { Icon: PartyPopper, color: 'text-brand-rosa',  bg: 'bg-brand-rosa/10' },
  pago:     { Icon: Wallet,      color: 'text-amber-600',   bg: 'bg-amber-50' },
  contrato: { Icon: FileText,    color: 'text-green-600',   bg: 'bg-green-50' },
  sistema:  { Icon: Info,        color: 'text-gray-500',    bg: 'bg-gray-100' },
}

export function NotificacionesPanel() {
  const { notificaciones, marcarLeida, marcarTodasLeidas } = useNotificacionesStore()
  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center bg-brand-rosa text-white text-[10px] font-black rounded-full leading-none">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 p-0 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">Notificaciones</p>
            {noLeidas > 0 && (
              <span className="bg-brand-rosa/10 text-brand-rosa text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {noLeidas} nuevas
              </span>
            )}
          </div>
          {noLeidas > 0 && (
            <button
              onClick={marcarTodasLeidas}
              className="flex items-center gap-1 text-xs font-semibold text-brand-azul hover:text-brand-azul/70 transition-colors"
            >
              <Check className="h-3 w-3" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-[360px] overflow-y-auto">
          {notificaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400 text-center font-medium">
                Sin notificaciones por ahora.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notificaciones.map((n) => (
                <NotificacionItem
                  key={n.id}
                  notificacion={n}
                  onMarcarLeida={() => marcarLeida(n.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
          <p className="text-[11px] text-gray-400">
            {notificaciones.length} notificacion{notificaciones.length !== 1 ? 'es' : ''}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface NotificacionItemProps {
  notificacion: Notificacion
  onMarcarLeida: () => void
}

function NotificacionItem({ notificacion: n, onMarcarLeida }: NotificacionItemProps) {
  const { Icon, color, bg } = TIPO_CONFIG[n.tipo]

  const inner = (
    <div
      onClick={onMarcarLeida}
      className={cn(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
        !n.leida && 'bg-blue-50/30'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5', bg)}>
        <Icon className={cn('h-4 w-4', color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm leading-tight',
              n.leida ? 'text-gray-600 font-medium' : 'text-gray-900 font-bold'
            )}
          >
            {n.titulo}
          </p>
          {!n.leida && (
            <div className="w-2 h-2 rounded-full bg-brand-azul shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">
          {n.mensaje}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          {formatDistanceToNow(n.fecha, { addSuffix: true, locale: es })}
        </p>
      </div>
    </div>
  )

  if (n.href) {
    return <Link href={n.href}>{inner}</Link>
  }
  return inner
}
