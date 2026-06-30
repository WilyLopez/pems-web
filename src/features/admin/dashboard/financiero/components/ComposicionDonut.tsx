'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { EmptyState } from '../../shared/components/EmptyState'
import { DesgloseItem } from '../utils/finance-calc'

const ALTO_DONUT = 180
const RADIO_INTERNO = 50
const RADIO_EXTERNO = 75

interface Props {
  titulo: string
  items: DesgloseItem[]
  total: number
}

export function ComposicionDonut({ titulo, items, total }: Props) {
  const conValor = items.filter((i) => i.value > 0)

  return (
    <DashboardCard className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {titulo}
      </h3>
      {total <= 0 || conValor.length === 0 ? (
        <EmptyState mensaje="Sin movimientos en el periodo." />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={ALTO_DONUT}>
            <PieChart>
              <Pie
                data={conValor}
                dataKey="value"
                nameKey="label"
                innerRadius={RADIO_INTERNO}
                outerRadius={RADIO_EXTERNO}
                paddingAngle={2}
              >
                {conValor.map((item) => (
                  <Cell key={item.label} fill={item.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="space-y-1.5">
            {conValor.map((item) => (
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
                  {formatCurrency(item.value)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </DashboardCard>
  )
}
