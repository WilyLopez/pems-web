'use client'

import { Users, XCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { MetricasReservas } from '../types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  metricas: MetricasReservas
}

export function MetricasReservasSection({ metricas }: Props) {
  const cards = [
    {
      label: 'Confirmadas',
      value: metricas.totalConfirmadas.toString(),
      icon: Users,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Completadas',
      value: metricas.totalCompletadas.toString(),
      icon: CheckCircle2,
      color: 'bg-brand-azul/10 text-brand-azul',
    },
    {
      label: 'Canceladas',
      value: metricas.totalCanceladas.toString(),
      icon: XCircle,
      color: 'bg-red-100 text-red-600',
    },
    {
      label: 'Ticket promedio',
      value: formatCurrency(metricas.ticketPromedio),
      icon: TrendingUp,
      color: 'bg-brand-amarillo/20 text-yellow-700',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2"
          >
            <div
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">
            Ingresos por efectivo (CAJA)
          </p>
          <p className="text-lg font-black text-emerald-700">
            {formatCurrency(metricas.ingresoEfectivo)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-semibold text-gray-500 mb-1">
            Ingresos por Yape
          </p>
          <p className="text-lg font-black text-purple-700">
            {formatCurrency(metricas.ingresoYape)}
          </p>
        </div>
      </div>
    </div>
  )
}
