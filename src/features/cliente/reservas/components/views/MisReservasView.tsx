'use client'

import { useAuth } from '@/hooks/useAuth'
import { Plus, Ticket, Clock } from 'lucide-react'
import Link from 'next/link'
import { useMisReservasNav } from '../../hooks/useMisReservasNav'
import { useMisReservasData } from '../../hooks/useMisReservasData'
import { ReservaCard } from '../ui/ReservaCard'
import { EmptyReservas } from '../ui/EmptyReservas'
import { ReservaDetalleDialog } from '../dialogs/ReservaDetalleDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'
import { ErrorState } from '@/components/common/Errorstate'

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="h-1 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-9 rounded-xl" />
      </div>
    </div>
  )
}

export function MisReservasView() {
  const { isAuthenticated } = useAuth()
  const { tab, setTab, detalleId, setDetalleId } = useMisReservasNav()
  const {
    reservas,
    isLoading,
    isError,
    refetch,
    reprogramar,
    isReprogramando,
    cancelar,
    isCancelando,
  } = useMisReservasData(isAuthenticated)

  const reservaDetalle = reservas.find((r) => r.id === detalleId) || null
  const setReservaDetalle = (reserva: Reserva | null) =>
    setDetalleId(reserva ? reserva.id : null)

  const proximas = reservas.filter((r) =>
    ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
  )

  const historial = reservas.filter((r) =>
    ['COMPLETADA', 'CANCELADA', 'REPROGRAMADA', 'EXPIRADA'].includes(r.estado)
  )

  const reservasMostradas = tab === 'proximas' ? proximas : historial

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            Mis reservas
          </h1>
          <p className="text-sm text-gray-500">
            Tus tickets de acceso a Kiki y Lala
          </p>
        </div>
        <Link
          href="/cliente/reservar"
          className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva reserva</span>
          <span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      <div className="inline-flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
        <button
          onClick={() => setTab('proximas')}
          className={cn(
            'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            tab === 'proximas'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
          type="button"
        >
          <Ticket className="h-3.5 w-3.5" />
          Próximas
          {proximas.length > 0 && !isLoading && (
            <span className="ml-1 bg-brand-azul text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {proximas.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('historial')}
          className={cn(
            'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            tab === 'historial'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
          type="button"
        >
          <Clock className="h-3.5 w-3.5" />
          Historial
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorState
          message="No se pudieron cargar tus reservas. Por favor, intenta de nuevo."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && reservasMostradas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservasMostradas.map((r) => (
            <ReservaCard
              key={r.id}
              reserva={r}
              onVerDetalle={() => setReservaDetalle(r)}
            />
          ))}
        </div>
      )}

      {!isLoading &&
        !isError &&
        reservasMostradas.length === 0 &&
        tab === 'proximas' && <EmptyReservas />}

      {!isLoading &&
        !isError &&
        reservasMostradas.length === 0 &&
        tab === 'historial' && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3 px-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Clock className="h-7 w-7 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-900">Sin historial aún</p>
              <p className="text-sm text-gray-500 mt-1">
                Aquí aparecerán tus visitas anteriores a Kiki y Lala.
              </p>
            </div>
          </div>
        )}

      <ReservaDetalleDialog
        reserva={reservaDetalle}
        open={!!reservaDetalle}
        onClose={() => setReservaDetalle(null)}
        onReprogramar={reprogramar}
        isReprogramando={isReprogramando}
        onCancelar={cancelar}
        isCancelando={isCancelando}
      />
    </div>
  )
}
