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
    <div className="bg-white rounded-3xl border border-gray-100/80 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
      <div
        className={cn(
          'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300',
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-tight">
          {value}
        </p>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5 truncate">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

export const ReservasMetrics = React.memo(
  ({ metricas }: ReservasMetricsProps) => {
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
  }
)

ReservasMetrics.displayName = 'ReservasMetrics'
