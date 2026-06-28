'use client'

import { CalendarDays, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardAdmin, AgendaReserva } from '@/types/dashboard.types'

const ESTADO_STYLES: Record<string, string> = {
  CONFIRMADA: 'bg-green-100 text-green-700',
  PENDIENTE: 'bg-amber-100 text-amber-700',
  COMPLETADA: 'bg-blue-100 text-blue-700',
  CANCELADA: 'bg-red-100 text-red-700',
  REPROGRAMADA: 'bg-purple-100 text-purple-700',
}

const ESTADO_LABEL: Record<string, string> = {
  CONFIRMADA: 'Confirmada',
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
}

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
        'rounded-full font-semibold shrink-0',
        compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
        ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-600'
      )}
    >
      {compact ? estado.charAt(0) : (ESTADO_LABEL[estado] ?? estado)}
    </span>
  )
}

interface TurnoSeccionProps {
  titulo: string
  horario: string
  reservas: AgendaReserva[]
  aforoMax: number
}

function TurnoSeccion({
  titulo,
  horario,
  reservas,
  aforoMax,
}: TurnoSeccionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
          {titulo}{' '}
          <span className="font-normal normal-case text-gray-300">
            · {horario}
          </span>
        </p>
        <span className="text-xs font-semibold text-gray-500">
          {reservas.length}/{aforoMax}
        </span>
      </div>
      {reservas.length === 0 ? (
        <p className="text-xs text-gray-300 italic">Sin reservas</p>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {reservas.map((r) => (
            <div
              key={r.numeroTicket}
              className="flex items-center justify-between gap-2 py-1"
            >
              <span className="text-sm text-gray-700 truncate">
                {r.nombreNino}{' '}
                <span className="text-gray-400">({r.edadNino})</span>
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
  data: DashboardAdmin
}

export function AgendaDelDia({ data }: Props) {
  const sinAgenda =
    data.reservasHoyDetalle.length === 0 && data.eventosHoyDetalle.length === 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
        Agenda de hoy
      </h3>

      {sinAgenda ? (
        <div className="text-center py-8">
          <CalendarDays className="h-10 w-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">
            No hay reservas ni eventos para hoy.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <TurnoSeccion
            titulo="Turno mañana"
            horario="10:00–14:00"
            reservas={data.reservasHoyDetalle}
            aforoMax={data.aforoMaximo}
          />

          {data.eventosHoyDetalle.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-rosa mb-2">
                Eventos hoy
              </p>
              {data.eventosHoyDetalle.map((ev) => (
                <div key={ev.id} className="flex items-center gap-2 py-1.5">
                  <PartyPopper className="h-4 w-4 text-brand-rosa shrink-0" />
                  <span className="text-sm text-gray-700 truncate">
                    {ev.tipoEvento} — {ev.nombreCliente}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {ev.turno}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
