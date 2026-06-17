'use client'

import React from 'react'
import { isToday } from 'date-fns'
import { Lock, Sun, Sunset, Ticket } from 'lucide-react'
import { Disponibilidad } from '../../types'
import { cn, formatCurrency } from '@/lib/utils'
import { isPast } from '../../utils/date-helpers'

interface CalendarioCeldaProps {
  day: Date
  disp?: Disponibilidad
  loading?: boolean
  selected: boolean
  onSelect: (day: Date) => void
}

export const CalendarioCelda = React.memo(({
  day,
  disp,
  loading,
  selected,
  onSelect,
}: CalendarioCeldaProps) => {
  if (loading) {
    return (
      <div className="relative h-[88px] sm:h-24 w-full rounded-xl border border-gray-100 bg-white p-1.5 text-left">
        <div className="h-3 w-3 rounded bg-gray-200 animate-pulse" />
      </div>
    )
  }

  const hoy = isToday(day)
  const pasado = isPast(day)
  const tieneReservas = (disp?.totalReservas ?? 0) > 0
  const tipo = disp?.tipoOcupacion
  
  const bloqueado = tipo === 'BLOQUEADO'
  const feriado = tipo === 'FERIADO'
  const esPrivadoParcial = tipo === 'PRIVADO_PARCIAL' && !tieneReservas
  const esPrivadoLleno = tipo === 'PRIVADO_LLENO'
  const esPrivado = esPrivadoParcial || esPrivadoLleno
  const pct = disp?.ocupacionPorcentaje ?? 0
  const lleno = (pct >= 100 || !!disp?.aforoCompleto) && !bloqueado && !feriado && !esPrivado

  const bgClass = pasado && !selected
    ? 'bg-gray-50/70 border-gray-100 opacity-60'
    : selected
    ? 'bg-brand-azul/10 border-brand-azul ring-1 ring-brand-azul'
    : bloqueado
    ? 'bg-red-50 border-red-200 hover:border-red-300'
    : feriado
    ? 'bg-purple-50 border-purple-200'
    : esPrivadoLleno
    ? 'bg-brand-rosa/8 border-brand-rosa/40'
    : esPrivadoParcial
    ? 'bg-brand-rosa/4 border-brand-rosa/20'
    : lleno
    ? 'bg-red-50 border-red-200'
    : pct > 70
    ? 'bg-orange-50/60 border-orange-200'
    : pct > 30
    ? 'bg-yellow-50/60 border-yellow-200'
    : pct > 0 || tieneReservas
    ? 'bg-green-50/60 border-green-200'
    : hoy
    ? 'bg-brand-azul/5 border-brand-azul/40'
    : 'bg-white border-gray-100 hover:border-brand-azul/40 hover:bg-gray-50/80'


  const numColor = cn(
    'text-sm font-black leading-none',
    (hoy || selected) && !bloqueado && !feriado && !esPrivado && 'text-brand-azul',
    bloqueado && 'text-red-500',
    feriado && 'text-purple-700',
    esPrivado && 'text-brand-rosa',
    !hoy && !selected && !bloqueado && !feriado && !esPrivado && 'text-gray-800'
  )

  const barColor =
    pct >= 90
      ? 'bg-red-500'
      : pct >= 70
      ? 'bg-orange-400'
      : pct >= 40
      ? 'bg-yellow-400'
      : 'bg-green-500'

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
        {!bloqueado && !feriado && !esPrivado && (disp?.ingresoEstimado ?? 0) > 0 && (
          <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1 rounded leading-tight shrink-0">
            {formatCurrency(disp!.ingresoEstimado, 0)}
          </span>
        )}
      </div>

      {disp && !bloqueado && !feriado && (
        <>
          {esPrivado && (
            <div className="flex flex-col gap-0.5 mt-1">
              {disp.turnoT1Ocupado && disp.tituloEventoT1 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-brand-rosa bg-brand-rosa/10 px-1 rounded truncate max-w-full">
                  <Sun className="h-2 w-2 shrink-0" />
                  <span className="truncate">{disp.tituloEventoT1}</span>
                </span>
              )}
              {disp.turnoT2Ocupado && disp.tituloEventoT2 && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-brand-rosa bg-brand-rosa/10 px-1 rounded truncate max-w-full">
                  <Sunset className="h-2 w-2 shrink-0" />
                  <span className="truncate">{disp.tituloEventoT2}</span>
                </span>
              )}
              {esPrivadoParcial && !pasado && (
                <span className="text-[9px] font-bold text-gray-400 mt-0.5">
                  {!disp.turnoT1Ocupado ? 'T1 libre' : 'T2 libre'}
                </span>
              )}
              {esPrivadoLleno && (
                <span className="text-[9px] font-bold text-brand-rosa/70">
                  T1 + T2
                </span>
              )}
            </div>
          )}

          {!esPrivado && (
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
                {lleno && (
                  <span className="text-[9px] font-bold text-orange-700 bg-orange-100 px-1 rounded">
                    Lleno
                  </span>
                )}
              </div>
            </>
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
})

CalendarioCelda.displayName = 'CalendarioCelda'
