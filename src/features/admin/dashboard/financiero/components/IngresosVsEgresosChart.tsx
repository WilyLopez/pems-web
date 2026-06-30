'use client'

import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { SerieDiaFinanciera } from '@/features/admin/finanzas'
import { ChartCard } from '../../shared/components/ChartCard'

const COLOR_INGRESOS = '#10b981'
const COLOR_EGRESOS = '#ef4444'
const COLOR_UTILIDAD = '#00AEEF'

interface Props {
  data: SerieDiaFinanciera[]
}

export function IngresosVsEgresosChart({ data }: Props) {
  const chartData = data.map((d) => ({
    fecha: format(parseISO(d.fecha), 'd MMM', { locale: es }),
    ingresos: d.ingresos,
    egresos: d.egresos,
    utilidad: d.ingresos - d.egresos,
  }))

  return (
    <ChartCard
      titulo="Ingresos vs egresos del mes"
      alto={260}
      vacio={chartData.length === 0}
      mensajeVacio="Sin movimientos en el periodo."
    >
      <ComposedChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="fecha"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="ingresos" name="Ingresos" fill={COLOR_INGRESOS} radius={[3, 3, 0, 0]} />
        <Bar dataKey="egresos" name="Egresos" fill={COLOR_EGRESOS} radius={[3, 3, 0, 0]} />
        <Line
          type="monotone"
          dataKey="utilidad"
          name="Utilidad"
          stroke={COLOR_UTILIDAD}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ChartCard>
  )
}
