'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { Plus, Ticket, Clock } from 'lucide-react'
import Link from 'next/link'

import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/types/reserva.types'
import { EstadoReserva } from '@/types/enums'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { ReservaCard } from '@/components/cliente/ReservaCard'
import { EmptyReservas } from '@/components/cliente/EmptyReservas'
import { ReservaDetalleModal } from '@/components/cliente/ReservaDetalleModal'

type Tab = 'proximas' | 'historial'

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

export default function MisReservasPage() {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState<Tab>('proximas')
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['mis-reservas'],
    queryFn: () => reservaService.listar({ page: 0, size: 50 }),
    enabled: isAuthenticated,
  })

  const proximas: Reserva[] =
    data?.content.filter((r: Reserva) =>
      [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE].includes(
        r.estado as EstadoReserva
      )
    ) ?? []

  const historial: Reserva[] =
    data?.content.filter((r: Reserva) =>
      [
        EstadoReserva.COMPLETADA,
        EstadoReserva.CANCELADA,
        EstadoReserva.REPROGRAMADA,
      ].includes(r.estado as EstadoReserva)
    ) ?? []

  const reservasMostradas = tab === 'proximas' ? proximas : historial

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Mis reservas</h1>
          <p className="text-sm text-gray-500">Tus tickets de acceso a Kiki y Lala</p>
        </div>
        <Link
          href="/reservar"
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

      {!isLoading && reservasMostradas.length > 0 && (
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

      {!isLoading && reservasMostradas.length === 0 && tab === 'proximas' && (
        <EmptyReservas />
      )}

      {!isLoading && reservasMostradas.length === 0 && tab === 'historial' && (
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

      <ReservaDetalleModal
        reserva={reservaDetalle}
        open={!!reservaDetalle}
        onClose={() => setReservaDetalle(null)}
      />
    </div>
  )
}
