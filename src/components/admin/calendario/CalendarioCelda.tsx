'use client'

import { isToday, isSameDay } from 'date-fns'
import {
  Lock,
  Sun,
  Sunset,
  Ticket,
  PartyPopper,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import { Disponibilidad } from '@/types/calendario.types'
import { cn, formatCurrency } from '@/lib/utils'

interface CalendarioCeldaProps {
  day: Date
  disp?: Disponibilidad
  loading?: boolean
  selected: boolean
  onSelect: (day: Date) => void
}

function OcupacionBar({ pct }: { pct: number }) {
  const color =
    pct >= 90
      ? 'bg-red-500'
      : pct >= 70
        ? 'bg-orange-400'
        : pct >= 40
          ? 'bg-yellow-400'
          : 'bg-green-500'

  return (
    <div className="h-1 w-full rounded-full bg-gray-100 mt-1">
      <div
        className={cn('h-1 rounded-full transition-all', color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function TurnoIndicador({
  disponible,
  label,
}: {
  disponible: boolean
  label: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded',
        disponible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      )}
    >
      {label === 'T1' ? (
        <Sun className="h-2 w-2" />
      ) : (
        <Sunset className="h-2 w-2" />
      )}
      {label}
    </span>
  )
}

export function CalendarioCelda({
  day,
  disp,
  loading,
  selected,
  onSelect,
}: CalendarioCeldaProps) {
  const hoy = isToday(day)
  const bloqueado =
    disp && (!disp.accesoPublicoActivo || disp.bloqueadoManualmente)
  const lleno = disp?.aforoCompleto && !bloqueado
  const feriado = disp?.esFeriado

  const bgClass = bloqueado
    ? 'bg-red-50 border-red-200 hover:border-red-300'
    : lleno
      ? 'bg-orange-50 border-orange-200'
      : feriado
        ? 'bg-purple-50 border-purple-200'
        : hoy && !selected
          ? 'bg-brand-azul/5 border-brand-azul/40'
          : selected
            ? 'bg-brand-azul/10 border-brand-azul ring-1 ring-brand-azul'
            : 'bg-white border-gray-100 hover:border-brand-azul/40 hover:bg-gray-50/80'

  return (
    <button
      onClick={() => onSelect(day)}
      disabled={loading}
      className={cn(
        'relative h-[88px] sm:h-24 w-full rounded-xl border p-1.5 flex flex-col text-left transition-all duration-150 overflow-hidden',
        bgClass,
        loading && 'animate-pulse'
      )}
    >
      <div className="flex items-start justify-between w-full">
        <span
          className={cn(
            'text-sm font-black leading-none',
            hoy && !selected && 'text-brand-azul',
            selected && 'text-brand-azul',
            bloqueado && 'text-red-500',
            feriado && !bloqueado && 'text-purple-700',
            !hoy && !selected && !bloqueado && !feriado && 'text-gray-800'
          )}
        >
          {day.getDate()}
        </span>

        {feriado && !bloqueado && (
          <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 rounded leading-tight max-w-[44px] truncate">
            {disp?.descripcionFeriado ?? 'Feriado'}
          </span>
        )}
        {bloqueado && <Lock className="h-3 w-3 text-red-400 shrink-0" />}
        {disp?.ingresoEstimado && disp.ingresoEstimado > 0 && !bloqueado && (
          <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1 rounded leading-tight">
            {formatCurrency(disp.ingresoEstimado, 0)}
          </span>
        )}
      </div>

      {disp && !bloqueado && (
        <>
          <OcupacionBar pct={disp.ocupacionPorcentaje} />

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

          <div className="flex gap-0.5 mt-auto">
            <TurnoIndicador disponible={disp.turnoT1Disponible} label="T1" />
            <TurnoIndicador disponible={disp.turnoT2Disponible} label="T2" />
          </div>
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
