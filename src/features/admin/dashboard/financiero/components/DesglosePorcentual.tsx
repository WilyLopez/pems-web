'use client'

import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { DesgloseItem, porcentaje } from '../utils/finance-calc'

interface Props {
  titulo: string
  icon: LucideIcon
  items: DesgloseItem[]
  total: number
}

export function DesglosePorcentual({ titulo, icon: Icon, items, total }: Props) {
  return (
    <DashboardCard className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
        <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        {titulo}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => {
          const pct = porcentaje(item.value, total)
          return (
            <li key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.label}
                </span>
                <span className="font-semibold tabular-nums text-gray-800 dark:text-gray-200">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </DashboardCard>
  )
}
