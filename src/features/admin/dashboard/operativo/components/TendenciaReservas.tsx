'use client'

import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { ChartCard } from '../../shared/components/ChartCard'
import { ReservasDia } from '../../shared/types'

const COLOR_LINEA = '#00AEEF'
const GRADIENT_ID = 'tendenciaReservasFill'

interface Props {
  data: ReservasDia[]
}

export function TendenciaReservas({ data }: Props) {
  const chartData = data.map((d) => ({
    fecha: format(parseISO(d.fecha), 'd MMM', { locale: es }),
    reservas: d.cantidad,
  }))

  return (
    <ChartCard titulo="Reservas — últimos 30 días" vacio={chartData.length === 0}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_LINEA} stopOpacity={0.35} />
            <stop offset="100%" stopColor={COLOR_LINEA} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="fecha"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="reservas"
          stroke={COLOR_LINEA}
          strokeWidth={2}
          fill={`url(#${GRADIENT_ID})`}
          dot={{ r: 2 }}
          name="Reservas"
        />
      </AreaChart>
    </ChartCard>
  )
}
