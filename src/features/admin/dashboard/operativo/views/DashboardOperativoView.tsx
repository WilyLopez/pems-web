'use client'

import { RefreshCw } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { DashboardCard } from '../../shared/components/DashboardCard'
import { DashboardSkeleton } from '../../shared/components/DashboardSkeleton'
import { EnVivoIndicator } from '../../shared/components/EnVivoIndicator'
import { useDashboardOperativo } from '../hooks/useDashboardOperativo'
import { saludoSegunHora } from '../utils/kpi-helpers'
import { KpisDelDia } from '../components/KpisDelDia'
import { AccionesPendientes } from '../components/AccionesPendientes'
import { AgendaDelDia } from '../components/AgendaDelDia'
import { DisponibilidadSemana } from '../components/DisponibilidadSemana'
import { TendenciaReservas } from '../components/TendenciaReservas'

export function DashboardOperativoView() {
  const { idSede, isLoading: authLoading } = useAuth()
  const {
    data,
    isLoading: queryLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
    refetch,
  } = useDashboardOperativo(idSede ?? undefined)

  const isLoading = authLoading || (!!idSede && queryLoading)
  const mensajeError =
    error instanceof Error ? error.message : 'Error desconocido'

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl dark:text-gray-100">
            {saludoSegunHora(new Date().getHours())}
          </h1>
          <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
            {data
              ? formatDate(data.fecha, "EEEE d 'de' MMMM yyyy")
              : 'Resumen diario'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data && (
            <EnVivoIndicator
              enVivo={!!idSede}
              actualizadoEn={dataUpdatedAt}
              cargando={isFetching}
            />
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching || !idSede}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-brand-azul/40 hover:text-brand-azul disabled:opacity-50 sm:px-4 dark:border-gray-700 dark:text-gray-300"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <DashboardCard className="flex flex-col items-center justify-center border-dashed py-12">
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            No se pudo cargar el dashboard
          </p>
          <p className="max-w-md px-4 text-center text-xs text-red-400">
            {mensajeError}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-xs font-bold text-brand-azul hover:underline"
          >
            Reintentar
          </button>
        </DashboardCard>
      ) : !idSede ? (
        <DashboardCard className="border-dashed py-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tienes una sede asignada para ver este dashboard.
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Contacta al administrador si crees que esto es un error.
          </p>
        </DashboardCard>
      ) : data ? (
        <>
          <KpisDelDia data={data} />
          <AccionesPendientes data={data} />
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
            <AgendaDelDia data={data} />
            <DisponibilidadSemana data={data.disponibilidadSemana} />
          </div>
          <TendenciaReservas data={data.reservasUltimos30Dias} />
        </>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No hay datos disponibles.
        </p>
      )}
    </div>
  )
}
