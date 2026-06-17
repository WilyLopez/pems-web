'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ResumenDiario } from '@/types/finanzas.types'

interface Props {
  dias: ResumenDiario[]
}

const fmt = (v: number) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)

export function GraficaLineaDiaria({ dias }: Props) {
  const data = dias.map((d) => ({
    fecha: d.fecha.slice(5),
    ingresos: d.ingresoReservas,
    gastos: d.gastoOperativo,
    utilidad: d.utilidadDia,
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} width={72} />
        <Tooltip formatter={(v) => fmt(Number(v))} />
        <Legend />
        <Line
          type="monotone"
          dataKey="ingresos"
          name="Ingresos"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          name="Gastos"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="utilidad"
          name="Utilidad"
          stroke="#1e40af"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
