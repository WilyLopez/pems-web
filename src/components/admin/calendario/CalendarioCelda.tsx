'use client'

import { isToday } from 'date-fns'
import { Lock, Sun, Sunset, Ticket, PartyPopper } from 'lucide-react'
import { Disponibilidad } from '@/types/calendario.types'
import { cn, formatCurrency } from '@/lib/utils'

interface CalendarioCeldaProps {
  day: Date
  disp?: Disponibilidad
  loading?: boolean
  selected: boolean
  onSelect: (day: Date) => void
}

export function CalendarioCelda({
  day,
  disp,
  loading,
  selected,
  onSelect,
}: CalendarioCeldaProps) {
  if (loading) {
    return (
      <button
        onClick={() => onSelect(day)}
        className="relative h-[88px] sm:h-24 w-full rounded-xl border border-gray-100 bg-white p-1.5 text-left"
      >
        <div className="h-3 w-3 rounded bg-gray-200 animate-pulse" />
      </button>
    )
  }

  const hoy = isToday(day)
  const bloqueado = !!disp && (!disp.accesoPublicoActivo || disp.bloqueadoManualmente)
  const feriado = !!disp?.esFeriado && !bloqueado
  const pct = disp?.ocupacionPorcentaje ?? 0
  const lleno = (pct >= 100 || !!disp?.aforoCompleto) && !bloqueado

  const bgClass = selected
    ? 'bg-brand-azul/10 border-brand-azul ring-1 ring-brand-azul'
    : bloqueado
    ? 'bg-red-50 border-red-200 hover:border-red-300'
    : feriado
    ? 'bg-purple-50 border-purple-200'
    : lleno
    ? 'bg-red-50 border-red-200'
    : pct > 70
    ? 'bg-orange-50/60 border-orange-200'
    : pct > 30
    ? 'bg-yellow-50/60 border-yellow-200'
    : pct > 0
    ? 'bg-green-50/60 border-green-200'
    : hoy
    ? 'bg-brand-azul/5 border-brand-azul/40'
    : 'bg-white border-gray-100 hover:border-brand-azul/40 hover:bg-gray-50/80'

  const numColor = cn(
    'text-sm font-black leading-none',
    (hoy || selected) && !bloqueado && !feriado && 'text-brand-azul',
    bloqueado && 'text-red-500',
    feriado && 'text-purple-700',
    !hoy && !selected && !bloqueado && !feriado && 'text-gray-800'
  )

  const barColor =
    pct >= 90
      ? 'bg-red-500'
      : pct >= 70
      ? 'bg-orange-400'
      : pct >= 40
      ? 'bg-yellow-400'
      : 'bg-green-500'

  const hasActivity = (disp?.totalReservas ?? 0) > 0 || (disp?.totalEventos ?? 0) > 0
  const showT1 = !!disp && !bloqueado && (!disp.turnoT1Disponible || hasActivity)
  const showT2 = !!disp && !bloqueado && (!disp.turnoT2Disponible || hasActivity)

  return (
    <button
      onClick={() => onSelect(day)}
      className={cn(
        'relative h-[88px] sm:h-24 w-full rounded-xl border p-1.5 flex flex-col text-left transition-all duration-150 overflow-hidden hover:shadow-sm hover:scale-[1.01]',
        bgClass
      )}
    >
      <div className="flex items-start justify-between w-full gap-1">
        <span className={numColor}>{day.getDate()}</span>

        {feriado && (
          <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 rounded leading-tight max-w-[44px] truncate shrink-0">
            {(disp?.descripcionFeriado ?? 'Feriado').substring(0, 8)}
          </span>
        )}
        {bloqueado && (
          <Lock className="h-[10px] w-[10px] text-red-400 shrink-0 mt-0.5" />
        )}
        {!bloqueado && !feriado && (disp?.ingresoEstimado ?? 0) > 0 && (
          <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1 rounded leading-tight shrink-0">
            {formatCurrency(disp!.ingresoEstimado, 0)}
          </span>
        )}
      </div>

      {disp && !bloqueado && (
        <>
          <div className="h-[2px] w-full rounded-full bg-gray-100 mt-1">
            <div
              className={cn('h-[2px] rounded-full transition-all', barColor)}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-0.5 mt-1">
            {disp.totalReservas > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 rounded">
                <Ticket className="h-2 w-2" />
                {disp.totalReservas}
              </span>
            )}
            {disp.totalEventos > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-pink-700 bg-pink-50 px-1 rounded">
                <PartyPopper className="h-2 w-2" />
                {disp.totalEventos}
              </span>
            )}
            {lleno && (
              <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1 rounded">
                Lleno
              </span>
            )}
          </div>

          {(showT1 || showT2) && (
            <div className="flex gap-0.5 mt-auto">
              {showT1 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[9px] font-bold px-1 rounded',
                    disp.turnoT1Disponible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  <Sun className="h-2 w-2" />
                  T1
                </span>
              )}
              {showT2 && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[9px] font-bold px-1 rounded',
                    disp.turnoT2Disponible
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  <Sunset className="h-2 w-2" />
                  T2
                </span>
              )}
            </div>
          )}
        </>
      )}

      {bloqueado && (
        <p className="text-[9px] text-red-500 mt-1 leading-tight truncate">
          {disp?.tipoBloqueo?.replace('_', ' ') ?? 'Bloqueado'}
        </p>
      )}
    </button>
  )
}
