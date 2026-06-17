import React from 'react'
import { Ticket, BarChart2, XCircle, LogIn, TrendingUp } from 'lucide-react'
import { MetricasReserva } from '../../types'
import { formatCurrency, cn } from '@/lib/utils'

interface ReservasMetricsProps {
  metricas?: MetricasReserva
}

function MetricaCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

export const ReservasMetrics = React.memo(({ metricas }: ReservasMetricsProps) => {
  if (!metricas) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <MetricaCard
        icon={Ticket}
        label="Total del dia"
        value={metricas.totalReservas}
        color="bg-brand-azul/10 text-brand-azul"
      />
      <MetricaCard
        icon={BarChart2}
        label="Pendientes"
        value={metricas.pendientes}
        color="bg-yellow-100 text-yellow-700"
      />
      <MetricaCard
        icon={XCircle}
        label="Canceladas"
        value={metricas.canceladas}
        color="bg-red-100 text-red-600"
      />
      <MetricaCard
        icon={LogIn}
        label="Ingresados"
        value={metricas.ingresados}
        color="bg-green-100 text-green-700"
      />
      <MetricaCard
        icon={TrendingUp}
        label="Ingresos"
        value={formatCurrency(metricas.ingresosDia ?? 0, 0)}
        color="bg-brand-menta/20 text-emerald-700"
        sub={`${metricas.aforoRestante} plazas libres`}
      />
    </div>
  )
})

ReservasMetrics.displayName = 'ReservasMetrics'
