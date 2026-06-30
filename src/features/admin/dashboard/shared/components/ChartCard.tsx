'use client'

import { ResponsiveContainer } from 'recharts'
import { DashboardCard } from './DashboardCard'
import { EmptyState } from './EmptyState'

interface ChartCardProps {
  titulo: string
  alto?: number
  vacio?: boolean
  mensajeVacio?: string
  accion?: React.ReactNode
  children: React.ReactElement
}

export function ChartCard({
  titulo,
  alto = 220,
  vacio = false,
  mensajeVacio = 'Sin datos en el periodo.',
  accion,
  children,
}: ChartCardProps) {
  return (
    <DashboardCard>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 sm:text-base dark:text-gray-100">
          {titulo}
        </h3>
        {accion}
      </div>
      {vacio ? (
        <EmptyState mensaje={mensajeVacio} />
      ) : (
        <ResponsiveContainer width="100%" height={alto}>
          {children}
        </ResponsiveContainer>
      )}
    </DashboardCard>
  )
}
