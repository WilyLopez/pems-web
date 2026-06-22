'use client'

import { RefreshCw } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardAdmin } from '@/hooks/useDashboard'
import { KpisDelDia } from '@/components/admin/dashboard/KpisDelDia'
import { AccionesPendientes } from '@/components/admin/dashboard/AccionesPendientes'
import { AgendaDelDia } from '@/components/admin/dashboard/AgendaDelDia'
import { TendenciaReservas } from '@/components/admin/dashboard/TendenciaReservas'
import { DisponibilidadSemana } from '@/components/admin/dashboard/DisponibilidadSemana'
import { DashboardSkeleton } from '@/components/admin/dashboard/DashboardSkeleton'

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function AdminDashboardPage() {
  const { idSede, isLoading: authLoading } = useAuth()
  const { 
    data, 
    isLoading: queryLoading, 
    isError, 
    error,
    isFetching, 
    refetch 
  } = useDashboardAdmin(idSede ?? undefined)

  const isLoading = authLoading || (!!idSede && queryLoading)

  return (
    <div className="max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{saludo()}</h1>
          <p className="text-sm text-gray-500 capitalize">
            {data ? formatDate(data.fecha, "EEEE d 'de' MMMM yyyy") : 'Resumen diario'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching || !idSede}
          className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-brand-azul/40 hover:text-brand-azul transition-all disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : isError ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 flex flex-col items-center justify-center">
          <p className="text-sm text-gray-500 mb-2">No se pudo cargar el dashboard</p>
          {error && (
            <p className="text-xs text-red-400 max-w-md text-center px-4">
              {(error as any).message || 'Error desconocido'}
            </p>
          )}
          <button 
            onClick={() => refetch()}
            className="mt-4 text-xs font-bold text-brand-azul hover:underline"
          >
            Reintentar
          </button>
        </div>
      ) : !idSede ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-500">No tienes una sede asignada para ver este dashboard.</p>
          <p className="text-xs text-gray-400 mt-1">Contacta al administrador si crees que esto es un error.</p>
        </div>
      ) : data ? (
        <>
          <KpisDelDia data={data} />
          <AccionesPendientes data={data} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <AgendaDelDia data={data} />
            <DisponibilidadSemana data={data.disponibilidadSemana} />
          </div>
          <TendenciaReservas data={data.reservasUltimos30Dias} />
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-12">
          No hay datos disponibles.
        </p>
      )}
    </div>
  )
}
