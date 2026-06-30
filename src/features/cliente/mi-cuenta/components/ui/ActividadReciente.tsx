import { useMemo } from 'react'
import {
  History,
  Ticket,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  PartyPopper,
} from 'lucide-react'
import { parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Reserva, EventoPrivado } from '../../../shared/types'
import { SectionCard } from '../../../shared/components/SectionCard'
import { formatTipoEvento } from '../../../shared/constants'
import { cn, formatDate } from '@/lib/utils'

interface ActividadRecienteProps {
  reservas: Reserva[]
  eventos: EventoPrivado[]
}

interface TimelineItem {
  id: string
  titulo: string
  subtitulo: string
  fecha: string
  iconColor: string
  bgColor: string
  Icon: any
}

function formatRelativo(fecha: string): string {
  try {
    return formatDistanceToNow(parseISO(fecha), { addSuffix: true, locale: es })
  } catch {
    return ''
  }
}

function buildTimeline(
  reservas: Reserva[],
  eventos: EventoPrivado[]
): TimelineItem[] {
  const reservaConfig: Record<
    string,
    { titulo: string; iconColor: string; bgColor: string; Icon: any }
  > = {
    PENDIENTE: {
      titulo: 'Reserva creada',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      Icon: Ticket,
    },
    CONFIRMADA: {
      titulo: 'Reserva confirmada',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      Icon: CheckCircle2,
    },
    COMPLETADA: {
      titulo: 'Visita realizada',
      iconColor: 'text-brand-azul',
      bgColor: 'bg-brand-azul/10',
      Icon: CheckCircle2,
    },
    CANCELADA: {
      titulo: 'Reserva cancelada',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      Icon: XCircle,
    },
    REPROGRAMADA: {
      titulo: 'Reserva reprogramada',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      Icon: Clock,
    },
  }
  const eventoConfig: Record<
    string,
    { titulo: string; iconColor: string; bgColor: string; Icon: any }
  > = {
    SOLICITADA: {
      titulo: 'Evento solicitado',
      iconColor: 'text-brand-rosa',
      bgColor: 'bg-brand-rosa/10',
      Icon: PartyPopper,
    },
    CONFIRMADA: {
      titulo: 'Evento confirmado',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      Icon: CheckCircle2,
    },
    COMPLETADA: {
      titulo: 'Evento completado',
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      Icon: Star,
    },
    CANCELADA: {
      titulo: 'Evento cancelado',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      Icon: XCircle,
    },
  }

  const items: TimelineItem[] = [
    ...reservas.slice(0, 10).map((r) => {
      const c = reservaConfig[r.estado] ?? {
        titulo: r.estado,
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        Icon: Ticket,
      }
      return {
        id: `r-${r.id}`,
        titulo: c.titulo,
        subtitulo: `Visita de ${r.nombreNino} · ${formatDate(r.fechaEvento)}`,
        fecha: r.fechaCreacion ?? '',
        iconColor: c.iconColor,
        bgColor: c.bgColor,
        Icon: c.Icon,
      }
    }),
    ...eventos.slice(0, 10).map((e) => {
      const c = eventoConfig[e.estado] ?? {
        titulo: e.estado,
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-50',
        Icon: PartyPopper,
      }
      return {
        id: `e-${e.id}`,
        titulo: c.titulo,
        subtitulo: `${formatTipoEvento(e.tipoEvento)} · ${formatDate(e.fechaEvento)}`,
        fecha: e.fechaCreacion ?? '',
        iconColor: c.iconColor,
        bgColor: c.bgColor,
        Icon: c.Icon,
      }
    }),
  ]

  return items
    .sort((a, b) => parseISO(b.fecha).getTime() - parseISO(a.fecha).getTime())
    .slice(0, 8)
}

export function ActividadReciente({
  reservas,
  eventos,
}: ActividadRecienteProps) {
  const items = useMemo(
    () => buildTimeline(reservas, eventos),
    [reservas, eventos]
  )

  if (items.length === 0) {
    return (
      <SectionCard titulo="Actividad reciente" icon={History}>
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">Sin actividad registrada aún.</p>
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard titulo="Actividad reciente" icon={History}>
      <div className="flex sm:flex-col overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none gap-4 sm:gap-0 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:flex-row sm:gap-3 relative min-w-[200px] sm:min-w-0 snap-start bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none border border-gray-100 sm:border-transparent"
          >
            {/* Línea vertical para Desktop */}
            {idx < items.length - 1 && (
              <div className="hidden sm:block absolute left-4 top-8 bottom-0 w-px bg-gray-100" />
            )}
            
            <div className="flex items-center gap-3 sm:block mb-2 sm:mb-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10',
                  item.bgColor
                )}
              >
                <item.Icon className={cn('h-3.5 w-3.5', item.iconColor)} />
              </div>
              {/* Fecha visible en mobile junto al icono */}
              <p className="text-[11px] text-gray-400 sm:hidden">
                {formatRelativo(item.fecha)}
              </p>
            </div>

            <div className="sm:pb-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {item.titulo}
              </p>
              <p className="text-xs text-gray-500 truncate mt-1 sm:mt-0">{item.subtitulo}</p>
              {/* Fecha original en desktop */}
              <p className="hidden sm:block text-[11px] text-gray-400 mt-0.5">
                {formatRelativo(item.fecha)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

