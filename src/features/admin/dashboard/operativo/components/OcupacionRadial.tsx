'use client'

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { DashboardOperativo } from '../../shared/types'
import { nivelAforo, porcentajeAforo } from '../utils/kpi-helpers'

const COLOR_NIVEL: Record<string, string> = {
  critico: '#ef4444',
  alerta: '#f59e0b',
  normal: '#10b981',
}

interface Props {
  data: DashboardOperativo
}

export function OcupacionRadial({ data }: Props) {
  const pct = porcentajeAforo(data.reservasHoy, data.aforoMaximo)
  const color = COLOR_NIVEL[nivelAforo(pct)]
  const chartData = [{ name: 'ocupacion', value: Math.min(pct, 100) }]

  return (
    <DashboardCard>
      <h3 className="mb-2 text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
        Ocupación de hoy
      </h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#f1f5f9' }}
              dataKey="value"
              cornerRadius={12}
              fill={color}
              angleAxisId={0}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-3xl font-black tabular-nums"
            style={{ color }}
          >
            {pct}%
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {data.reservasHoy}/{data.aforoMaximo} plazas
          </span>
        </div>
      </div>
      <p className="mt-1 text-center text-xs text-gray-400 dark:text-gray-500">
        {data.plazasDisponibles} plazas libres
      </p>
    </DashboardCard>
  )
}
