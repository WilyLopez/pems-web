'use client'

import {
  Ticket,
  Users,
  AlertTriangle,
  PartyPopper,
  LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardAdmin } from '@/types/dashboard.types'

interface KpiCardProps {
  label: string
  valor: number | string
  icon: LucideIcon
  color: string
  detalle: string
}

function KpiCard({ label, valor, icon: Icon, color, detalle }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-400 leading-tight">
          {label}
        </span>
        <div
          className={cn(
            'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0',
            color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-lg sm:text-2xl font-black text-gray-900 leading-none">
        {valor}
      </p>
      <p className="text-[11px] sm:text-xs text-gray-400 mt-1.5 leading-tight">
        {detalle}
      </p>
    </div>
  )
}

interface Props {
  data: DashboardAdmin
}

export function KpisDelDia({ data }: Props) {
  const aforoUsado = data.reservasHoy
  const pctAforo =
    data.aforoMaximo > 0 ? Math.round((aforoUsado / data.aforoMaximo) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <KpiCard
        label="Reservas hoy"
        valor={data.reservasHoy}
        icon={Ticket}
        color="bg-brand-azul/10 text-brand-azul"
        detalle={`Confirmadas ${data.reservasConfirmadas} · Pendientes ${data.pendientesPago}`}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-gray-400">
            Aforo de hoy
          </span>
          <Users className="h-4 w-4 text-emerald-500" />
        </div>
        <p className="text-lg sm:text-2xl font-black text-gray-900">
          {aforoUsado}/{data.aforoMaximo}
        </p>
        <div className="h-1.5 w-full rounded-full bg-gray-100 mt-2">
          <div
            className={cn(
              'h-1.5 rounded-full transition-all',
              pctAforo >= 90
                ? 'bg-red-500'
                : pctAforo >= 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
            )}
            style={{ width: `${Math.min(pctAforo, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-gray-400 mt-1.5">
          {data.plazasDisponibles} plazas libres
        </p>
      </div>

      <KpiCard
        label="Pendientes de pago"
        valor={data.pendientesPago}
        icon={AlertTriangle}
        color="bg-amber-100 text-amber-600"
        detalle="Cobrar en caja"
      />

      <KpiCard
        label="Eventos esta semana"
        valor={data.eventosEstaSemana}
        icon={PartyPopper}
        color="bg-brand-rosa/10 text-brand-rosa"
        detalle="Confirmados"
      />
    </div>
  )
}
