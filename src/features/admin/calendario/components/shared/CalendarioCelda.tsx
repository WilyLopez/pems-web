'use client'

import React from 'react'
import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Lock, Sun, Sunset, Ticket } from 'lucide-react'
import { Disponibilidad } from '../../types'
import { cn, formatCurrency } from '@/lib/utils'
import { isPast } from '../../utils/date-helpers'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'

interface CalendarioCeldaProps {
  day: Date
  disp?: Disponibilidad
  loading?: boolean
  selected: boolean
  onSelect: (day: Date) => void
}

function barColor(pct: number) {
  return pct >= 90 ? 'bg-red-500'
    : pct >= 70 ? 'bg-orange-400'
    : pct >= 40 ? 'bg-yellow-400'
    : 'bg-green-500'
}

function CeldaPreview({ day, disp }: { day: Date; disp: Disponibilidad }) {
  const tipo = disp.tipoOcupacion
  const bloqueado = tipo === 'BLOQUEADO'
  const feriado = tipo === 'FERIADO'
  const esPrivado = tipo === 'PRIVADO_PARCIAL' || tipo === 'PRIVADO_LLENO'
  const pct = disp.ocupacionPorcentaje ?? 0
  const tieneReservas = disp.totalReservas > 0

  return (
    <div className="w-52 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-black text-gray-900 dark:text-gray-100 leading-tight">
          {format(day, "EEEE d 'de' MMMM", { locale: es }).replace(/^\w/, (c) => c.toUpperCase())}
        </p>
        {bloqueado && (
          <span className="shrink-0 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-full">
            Bloqueado
          </span>
        )}
        {feriado && (
          <span className="shrink-0 text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded-full">
            Feriado
          </span>
        )}
      </div>

      {bloqueado && (
        <div className="flex items-center gap-1.5 text-red-500">
          <Lock className="h-3 w-3 shrink-0" />
          <span className="text-[11px] font-medium">
            {disp.motivoBloqueo ?? disp.tipoBloqueo?.replace(/_/g, ' ') ?? 'Bloqueo manual'}
          </span>
        </div>
      )}

      {feriado && disp.descripcionFeriado && (
        <p className="text-[11px] text-purple-700 dark:text-purple-300 font-medium">
          {disp.descripcionFeriado}
        </p>
      )}

      {esPrivado && (
        <div className="space-y-1.5">
          {disp.turnoT1Ocupado && (
            <div className="flex items-center gap-1.5">
              <Sun className="h-3 w-3 text-brand-rosa shrink-0" />
              <span className="text-[11px] font-semibold text-brand-rosa truncate">
                {disp.tituloEventoT1 ?? 'Evento privado'}
              </span>
            </div>
          )}
          {disp.turnoT2Ocupado && (
            <div className="flex items-center gap-1.5">
              <Sunset className="h-3 w-3 text-brand-rosa shrink-0" />
              <span className="text-[11px] font-semibold text-brand-rosa truncate">
                {disp.tituloEventoT2 ?? 'Evento privado'}
              </span>
            </div>
          )}
          {tipo === 'PRIVADO_PARCIAL' && (
            <p className="text-[10px] text-gray-400 font-medium">
              {!disp.turnoT1Ocupado ? 'Turno mañana disponible' : 'Turno tarde disponible'}
            </p>
          )}
          {(disp.ingresoEstimado ?? 0) > 0 && (
            <p className="text-[11px] font-bold text-green-700 dark:text-green-400 tabular-nums">
              {formatCurrency(disp.ingresoEstimado, 0)}
            </p>
          )}
        </div>
      )}

      {!bloqueado && !feriado && !esPrivado && (
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={cn('h-1.5 rounded-full transition-all', barColor(pct))}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            {tieneReservas ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                <Ticket className="h-3 w-3" />
                {disp.totalReservas} reservas · {pct}%
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 font-medium">Sin reservas</span>
            )}
            {(disp.ingresoEstimado ?? 0) > 0 && (
              <span className="text-[11px] font-bold text-green-700 dark:text-green-400 tabular-nums shrink-0">
                {formatCurrency(disp.ingresoEstimado, 0)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
      <div className="relative h-[88px] sm:h-24 w-full rounded-xl border border-gray-100 bg-white p-1.5">
        <div className="flex items-start justify-between mb-1.5">
          <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="h-[2px] w-full rounded-full bg-gray-100 animate-pulse mt-2" />
        <div className="flex gap-1 mt-1.5">
          <div className="h-3 w-8 rounded bg-gray-200 animate-pulse" />
        </div>
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

  const bgClass = cn(
    pasado && !selected && 'bg-gray-50/70 border-gray-100 opacity-55',
    selected && 'bg-brand-azul/10 border-brand-azul ring-1 ring-brand-azul',
    !selected && !pasado && bloqueado && 'bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-950/30 dark:border-red-900/60',
    !selected && !pasado && feriado && 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900/60',
    !selected && !pasado && esPrivadoLleno && 'bg-brand-rosa/8 border-brand-rosa/40',
    !selected && !pasado && esPrivadoParcial && 'bg-brand-rosa/4 border-brand-rosa/20',
    !selected && !pasado && lleno && 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/60',
    !selected && !pasado && !bloqueado && !feriado && !esPrivado && !lleno && pct > 70 && 'bg-orange-50/60 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/40',
    !selected && !pasado && !bloqueado && !feriado && !esPrivado && !lleno && pct > 30 && pct <= 70 && 'bg-yellow-50/60 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900/40',
    !selected && !pasado && !bloqueado && !feriado && !esPrivado && !lleno && (pct > 0 || tieneReservas) && pct <= 30 && 'bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-900/40',
    !selected && !pasado && !bloqueado && !feriado && !esPrivado && !lleno && pct === 0 && !tieneReservas && hoy && 'bg-brand-azul/5 border-brand-azul/40',
    !selected && !pasado && !bloqueado && !feriado && !esPrivado && !lleno && pct === 0 && !tieneReservas && !hoy && 'bg-white border-gray-100 hover:border-brand-azul/40 hover:bg-gray-50/80',
  )

  const cell = (
    <button
      onClick={() => onSelect(day)}
      className={cn(
        'relative h-[88px] sm:h-24 w-full rounded-xl border p-1.5 flex flex-col text-left transition-all duration-150 overflow-hidden hover:shadow-sm',
        bgClass,
      )}
    >
      <div className="flex items-start justify-between w-full gap-1">
        <span
          className={cn(
            'inline-flex items-center justify-center text-sm font-black leading-none shrink-0',
            hoy
              ? 'h-[22px] w-[22px] rounded-full bg-brand-azul text-white text-xs'
              : selected
              ? 'text-brand-azul'
              : bloqueado
              ? 'text-red-500'
              : feriado
              ? 'text-purple-700 dark:text-purple-400'
              : esPrivado
              ? 'text-brand-rosa'
              : 'text-gray-800',
          )}
        >
          {day.getDate()}
        </span>

        {feriado && (
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-1 rounded leading-tight max-w-[44px] truncate shrink-0">
            {(disp?.descripcionFeriado ?? 'Feriado').substring(0, 8)}
          </span>
        )}
        {bloqueado && (
          <Lock className="h-[10px] w-[10px] text-red-400 shrink-0 mt-0.5" />
        )}
      </div>

      {disp && !bloqueado && !feriado && (
        <>
          {esPrivado && (
            <div className="flex flex-col gap-0.5 mt-1 flex-1">
              {disp.turnoT1Ocupado && disp.tituloEventoT1 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand-rosa bg-brand-rosa/10 px-1 rounded truncate max-w-full">
                  <Sun className="h-2 w-2 shrink-0" />
                  <span className="truncate">{disp.tituloEventoT1}</span>
                </span>
              )}
              {disp.turnoT2Ocupado && disp.tituloEventoT2 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand-rosa bg-brand-rosa/10 px-1 rounded truncate max-w-full">
                  <Sunset className="h-2 w-2 shrink-0" />
                  <span className="truncate">{disp.tituloEventoT2}</span>
                </span>
              )}
              {esPrivadoParcial && !pasado && (
                <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                  {!disp.turnoT1Ocupado ? 'T1 libre' : 'T2 libre'}
                </span>
              )}
            </div>
          )}

          {!esPrivado && (
            <div className="flex flex-col flex-1 justify-end gap-1 mt-1">
              <div className="h-[2px] w-full rounded-full bg-gray-100">
                <div
                  className={cn('h-[2px] rounded-full transition-all', barColor(pct))}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between gap-0.5">
                <div className="flex gap-0.5">
                  {tieneReservas && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1 rounded">
                      <Ticket className="h-2 w-2" />
                      {disp.totalReservas}
                    </span>
                  )}
                  {lleno && (
                    <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/40 px-1 rounded">
                      Lleno
                    </span>
                  )}
                </div>
                {(disp.ingresoEstimado ?? 0) > 0 && (
                  <span className="text-[10px] font-bold text-green-700 dark:text-green-400 tabular-nums shrink-0">
                    {formatCurrency(disp.ingresoEstimado, 0)}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {bloqueado && (
        <p className="text-[10px] text-red-500 mt-1 leading-tight truncate">
          {disp?.tipoBloqueo?.replace('_', ' ') ?? 'Bloqueado'}
        </p>
      )}
    </button>
  )

  if (!disp || selected) return cell

  return (
    <TooltipProvider delayDuration={350}>
      <Tooltip>
        <TooltipTrigger asChild>{cell}</TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          sideOffset={8}
          className="p-0 border-0 bg-transparent shadow-none"
        >
          <CeldaPreview day={day} disp={disp} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})

CalendarioCelda.displayName = 'CalendarioCelda'
