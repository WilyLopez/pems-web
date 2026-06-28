'use client'

import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ReservasDia } from '@/types/dashboard.types'

interface Props {
  data: ReservasDia[]
}

export function TendenciaReservas({ data }: Props) {
  const chartData = data.map((d) => ({
    fecha: format(parseISO(d.fecha), 'd MMM', { locale: es }),
    reservas: d.cantidad,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
      <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">
        Reservas — últimos 30 días
      </h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Sin datos en el período.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="reservas"
              stroke="#00AEEF"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Reservas"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
