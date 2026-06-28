'use client'

import { Ticket, Users, Wallet, PartyPopper } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { KpiCard } from '../../shared/components/KpiCard'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { variacionPct } from '../../shared/utils/delta'
import { DashboardOperativo } from '../../shared/types'
import { nivelAforo, porcentajeAforo } from '../utils/kpi-helpers'

const BARRA_NIVEL: Record<string, string> = {
  critico: 'bg-red-500',
  alerta: 'bg-amber-500',
  normal: 'bg-emerald-500',
}

interface Props {
  data: DashboardOperativo
}

export function KpisDelDia({ data }: Props) {
  const pctAforo = porcentajeAforo(data.reservasHoy, data.aforoMaximo)
  const nivel = nivelAforo(pctAforo)
  const deltaReservas = variacionPct(data.reservasHoy, data.reservasAyer)

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <KpiCard
        label="Reservas hoy"
        valor={data.reservasHoy}
        icon={Ticket}
        iconClassName="bg-brand-azul/10 text-brand-azul"
        variacion={deltaReservas}
        detalle={`Confirmadas ${data.reservasConfirmadas} · Pendientes ${data.pendientesPago}`}
      />

      <DashboardCard padded={false}>
        <div className="p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 sm:text-xs dark:text-gray-500">
              Aforo de hoy
            </span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black tabular-nums text-gray-900 sm:text-2xl dark:text-gray-100">
            {data.reservasHoy}/{data.aforoMaximo}
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className={cn('h-1.5 rounded-full transition-all', BARRA_NIVEL[nivel])}
              style={{ width: `${Math.min(pctAforo, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
            {data.plazasDisponibles} plazas libres
          </p>
        </div>
      </DashboardCard>

      <KpiCard
        label="Ingresos hoy"
        valor={formatCurrency(data.ingresosHoy)}
        icon={Wallet}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        detalle={`${data.pendientesPago} reservas por cobrar`}
      />

      <KpiCard
        label="Eventos esta semana"
        valor={data.eventosEstaSemana}
        icon={PartyPopper}
        iconClassName="bg-brand-rosa/10 text-brand-rosa"
        detalle="Confirmados"
      />
    </div>
  )
}
