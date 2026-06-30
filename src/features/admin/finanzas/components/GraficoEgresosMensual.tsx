'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DesgloseTipoEgreso } from '../types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  desglose: DesgloseTipoEgreso[]
}

const COLORS = [
  '#F43F5E', // Rose 500
  '#3B82F6', // Blue 500
  '#F59E0B', // Amber 500
  '#10B981', // Emerald 500
  '#8B5CF6', // Violet 500
  '#06B6D4', // Cyan 500
  '#EC4899', // Pink 500
]

export function GraficoEgresosMensual({ desglose }: Props) {
  const chartData = desglose
    .filter((d) => d.totalMonto > 0)
    .map((d, index) => ({
      name: d.nombreTipo,
      value: d.totalMonto,
      color: COLORS[index % COLORS.length],
    }))

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend
              verticalAlign="bottom"
              height={36}
              content={({ payload }) => (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                  {payload?.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                      <span
                        className="h-2 w-2 rounded-sm shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="truncate max-w-[120px]">{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
