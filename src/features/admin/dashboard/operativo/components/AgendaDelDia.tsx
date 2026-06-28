'use client'

import { CalendarDays, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { EmptyState } from '../../shared/components/EmptyState'
import { DashboardOperativo, AgendaReserva } from '../../shared/types'
import { ESTADO_RESERVA_LABEL, ESTADO_RESERVA_STYLE } from '../config'

function EstadoBadge({
  estado,
  compact,
}: {
  estado: string
  compact?: boolean
}) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full font-semibold',
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs',
        ESTADO_RESERVA_STYLE[estado] ??
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
      )}
    >
      {compact ? estado.charAt(0) : (ESTADO_RESERVA_LABEL[estado] ?? estado)}
    </span>
  )
}

interface ReservasSeccionProps {
  reservas: AgendaReserva[]
  aforoMax: number
}

function ReservasSeccion({ reservas, aforoMax }: ReservasSeccionProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Reservas de hoy
        </p>
        <span className="text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
          {reservas.length}/{aforoMax}
        </span>
      </div>
      {reservas.length === 0 ? (
        <p className="text-xs italic text-gray-300 dark:text-gray-600">
          Sin reservas
        </p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
          {reservas.map((r) => (
            <div
              key={r.numeroTicket}
              className="flex items-center justify-between gap-2 py-1"
            >
              <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                {r.nombreNino}{' '}
                <span className="text-gray-400 dark:text-gray-500">
                  ({r.edadNino})
                </span>
              </span>
              <EstadoBadge estado={r.estado} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  data: DashboardOperativo
}

export function AgendaDelDia({ data }: Props) {
  const sinAgenda =
    data.reservasHoyDetalle.length === 0 && data.eventosHoyDetalle.length === 0

  return (
    <DashboardCard>
      <h3 className="mb-4 text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
        Agenda de hoy
      </h3>

      {sinAgenda ? (
        <EmptyState
          icon={CalendarDays}
          mensaje="No hay reservas ni eventos para hoy."
        />
      ) : (
        <div className="space-y-4">
          <ReservasSeccion
            reservas={data.reservasHoyDetalle}
            aforoMax={data.aforoMaximo}
          />

          {data.eventosHoyDetalle.length > 0 && (
            <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-rosa">
                Eventos hoy
              </p>
              {data.eventosHoyDetalle.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 py-1.5">
                  <PartyPopper className="h-4 w-4 shrink-0 text-brand-rosa" />
                  <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                    {ev.tipoEvento} — {ev.nombreCliente}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {ev.turno}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardCard>
  )
}
