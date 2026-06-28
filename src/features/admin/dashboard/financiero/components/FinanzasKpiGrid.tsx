'use client'

import { TrendingUp, TrendingDown, DollarSign, Ticket } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardFinanciero } from '@/features/admin/finanzas'
import { KpiCard } from '../../shared/components/KpiCard'
import { variacionPct } from '../../shared/utils/delta'
import { margenPct } from '../utils/finance-calc'

interface Props {
  data: DashboardFinanciero
}

export function FinanzasKpiGrid({ data }: Props) {
  const utilidadPositiva = data.utilidadNeta >= 0
  const margen = margenPct(data.utilidadNeta, data.totalIngresos)
  const deltaIngresos = variacionPct(
    data.totalIngresos,
    data.totalIngresosMesAnterior
  )
  const deltaEgresos = variacionPct(
    data.totalEgresos,
    data.totalEgresosMesAnterior
  )
  const deltaUtilidad = variacionPct(
    data.utilidadNeta,
    data.utilidadMesAnterior
  )

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        label="Total ingresos"
        valor={formatCurrency(data.totalIngresos)}
        icon={TrendingUp}
        iconClassName="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        variacion={deltaIngresos}
        detalle={`Reservas ${formatCurrency(data.ingresoReservas)} · Adelantos ${formatCurrency(data.ingresoAdelantos)}`}
      />
      <KpiCard
        label="Total egresos"
        valor={formatCurrency(data.totalEgresos)}
        icon={TrendingDown}
        iconClassName="bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300"
        variacion={deltaEgresos}
        invertirColor
        detalle={`Fijo ${formatCurrency(data.egresoFijo)} · Variable ${formatCurrency(data.egresoVariable)}`}
      />
      <KpiCard
        label="Utilidad neta"
        valor={formatCurrency(data.utilidadNeta)}
        icon={DollarSign}
        iconClassName={
          utilidadPositiva
            ? 'bg-brand-azul/10 text-brand-azul'
            : 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300'
        }
        valorClassName={
          utilidadPositiva
            ? 'text-brand-azul'
            : 'text-red-600 dark:text-red-400'
        }
        variacion={deltaUtilidad}
        detalle={`Margen ${margen.toFixed(1)}%`}
      />
      <KpiCard
        label="Ticket promedio"
        valor={formatCurrency(data.ticketPromedio)}
        icon={Ticket}
        iconClassName="bg-brand-amarillo/20 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
        detalle={`${data.reservasConfirmadas} reservas confirmadas`}
      />
    </div>
  )
}
