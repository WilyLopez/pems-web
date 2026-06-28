'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { EmptyState } from '../../shared/components/EmptyState'
import { DashboardOperativo } from '../../shared/types'

const ALTO = 180
const RADIO_INTERNO = 48
const RADIO_EXTERNO = 72

interface Props {
  data: DashboardOperativo
}

export function ComposicionReservas({ data }: Props) {
  const otras = Math.max(
    data.reservasHoy - data.reservasConfirmadas - data.pendientesPago,
    0
  )
  const items = [
    { label: 'Confirmadas', value: data.reservasConfirmadas, color: '#10b981' },
    { label: 'Pendientes', value: data.pendientesPago, color: '#f59e0b' },
    { label: 'Otras', value: otras, color: '#94a3b8' },
  ].filter((i) => i.value > 0)

  return (
    <DashboardCard>
      <h3 className="mb-2 text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
        Reservas de hoy por estado
      </h3>
      {data.reservasHoy === 0 || items.length === 0 ? (
        <EmptyState mensaje="Sin reservas registradas para hoy." />
      ) : (
        <div className="grid grid-cols-2 items-center gap-2">
          <ResponsiveContainer width="100%" height={ALTO}>
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="label"
                innerRadius={RADIO_INTERNO}
                outerRadius={RADIO_EXTERNO}
                paddingAngle={2}
              >
                {items.map((item) => (
                  <Cell key={item.label} fill={item.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </DashboardCard>
  )
}
