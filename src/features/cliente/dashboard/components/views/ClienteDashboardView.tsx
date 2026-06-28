'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { parseISO, startOfDay, differenceInDays } from 'date-fns'
import {
  Ticket,
  CalendarDays,
  PartyPopper,
  Wallet,
  MessageCircle,
  AlertTriangle,
  User,
} from 'lucide-react'
import Link from 'next/link'

import { reservaApi } from '@/features/cliente/shared/services/reserva.api'
import { eventoService } from '@/services/evento.service'
import { Reserva } from '@/features/cliente/shared/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'
import { EmptyReservas } from '@/features/cliente/reservas/components/ui/EmptyReservas'
import { ReservaDetalleDialog } from '@/features/cliente/reservas/components/dialogs/ReservaDetalleDialog'
import { StatCard } from '../ui/StatCard'
import { AccesoRapido } from '../ui/AccesoRapido'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { ErrorState } from '@/components/common/Errorstate'
import { clienteKeys } from '../../../shared/queryKeys'

function saludo(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

const DEFAULT_WHATSAPP_URL = 'https://wa.me/51987654321'

export function ClienteDashboardView() {
  const { nombre, isAuthenticated } = useAuth()
  const userName = nombre?.split(' ')[0] ?? 'Cliente'
  const [reservaDetalle, setReservaDetalle] = useState<Reserva | null>(null)
  const whatsappUrl =
    useWhatsAppUrl('Hola, necesito ayuda con mis reservas o eventos') ||
    DEFAULT_WHATSAPP_URL

  const {
    data: reservasData,
    isLoading: loadingReservas,
    isError: isReservasError,
    refetch: refetchReservas,
  } = useQuery({
    queryKey: clienteKeys.reservas.list({ page: 0, size: 20 }),
    queryFn: () => reservaApi.listar({ page: 0, size: 20 }),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const {
    data: eventosData,
    isLoading: loadingEventos,
    isError: isEventosError,
    refetch: refetchEventos,
  } = useQuery({
    queryKey: clienteKeys.eventos.list({ page: 0, size: 20 }),
    queryFn: () => eventoService.listar({ page: 0, size: 20 }),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  const isLoading = loadingReservas || loadingEventos
  const isError = isReservasError || isEventosError

  const handleRetry = () => {
    if (isReservasError) refetchReservas()
    if (isEventosError) refetchEventos()
  }

  const proximasReservas = useMemo<Reserva[]>(() => {
    const hoy = startOfDay(new Date())
    return (
      reservasData?.content
        ?.filter((r: Reserva) => {
          if (!['PENDIENTE', 'CONFIRMADA'].includes(r.estado)) return false
          return differenceInDays(startOfDay(parseISO(r.fechaEvento)), hoy) >= 0
        })
        ?.sort(
          (a: Reserva, b: Reserva) =>
            parseISO(a.fechaEvento).getTime() -
            parseISO(b.fechaEvento).getTime()
        ) ?? []
    )
  }, [reservasData])

  const proximaVisita = proximasReservas[0] ?? null
  const otrasReservas = proximasReservas.slice(1, 4)

  const totalPendiente = useMemo(() => {
    return (
      reservasData?.content
        ?.filter((r: Reserva) => r.estado === 'PENDIENTE')
        ?.reduce((sum: number, r: Reserva) => sum + r.totalPagado, 0) ?? 0
    )
  }, [reservasData])

  const eventosSolicitados = useMemo(() => {
    return (
      eventosData?.content?.filter(
        (e: { estado: string }) => e.estado === 'SOLICITADA'
      ).length ?? 0
    )
  }, [eventosData])

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
          {saludo()}, {userName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Bienvenido a tu área personal
        </p>
      </div>

      {isError ? (
        <ErrorState
          message="No se pudieron cargar los datos del dashboard. Por favor, intenta de nuevo."
          onRetry={handleRetry}
        />
      ) : (
        <>
          {loadingReservas ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                valor={proximasReservas.length}
                label="Próximas visitas"
                icon={Ticket}
                color="bg-brand-azul/10 text-brand-azul"
                href="/cliente/mis-reservas"
              />
              <StatCard
                valor={eventosSolicitados}
                label="Eventos solicitados"
                icon={PartyPopper}
                color="bg-brand-rosa/10 text-brand-rosa"
                href="/cliente/mis-eventos"
              />
              <StatCard
                valor={
                  totalPendiente > 0 ? formatCurrency(totalPendiente) : 'S/ 0'
                }
                label="Por pagar"
                icon={Wallet}
                color="bg-amber-100 text-amber-600"
                href="/cliente/mis-reservas"
              />
              <StatCard
                valor={
                  proximaVisita
                    ? formatDate(proximaVisita.fechaEvento, 'd MMM')
                    : '—'
                }
                label="Próxima visita"
                icon={CalendarDays}
                color="bg-green-100 text-green-600"
                href="/cliente/mis-reservas"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2 space-y-4">
              {loadingReservas && (
                <div className="space-y-3">
                  <Skeleton className="h-40 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                </div>
              )}

              {!loadingReservas && proximaVisita && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
                  <div className="bg-brand-azul/5 px-4 sm:px-5 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-brand-azul">
                      Tu próxima visita
                    </p>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg sm:text-xl font-black text-gray-900">
                          {formatDate(
                            proximaVisita.fechaEvento,
                            "EEEE d 'de' MMMM"
                          )}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Visita de {proximaVisita.nombreNino} ·{' '}
                          {proximaVisita.edadNino} años
                        </p>
                      </div>
                      <EstadoBadge estado={proximaVisita.estado} />
                    </div>
                    {proximaVisita.estado === 'PENDIENTE' && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800">
                          Pago pendiente en caja
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => setReservaDetalle(proximaVisita)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors"
                    >
                      Ver ticket
                    </button>
                  </div>
                </div>
              )}

              {!loadingReservas && otrasReservas.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900">Otras reservas</h3>
                    <Link
                      href="/cliente/mis-reservas"
                      className="text-xs font-semibold text-brand-azul hover:underline"
                    >
                      Ver todas
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {otrasReservas.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setReservaDetalle(r)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-9 h-9 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
                          <CalendarDays className="h-4 w-4 text-brand-azul" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {formatDate(r.fechaEvento, 'd MMM')} · Visita de{' '}
                            {r.nombreNino}
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.numeroTicket}
                          </p>
                        </div>
                        <EstadoBadge estado={r.estado} compact />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!loadingReservas && proximasReservas.length === 0 && (
                <EmptyReservas />
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-card">
                <h3 className="font-bold text-gray-900 mb-3">
                  Accesos rápidos
                </h3>
                <div className="space-y-1">
                  <AccesoRapido
                    href="/cliente/reservar"
                    icon={Ticket}
                    label="Reservar visita"
                    color="bg-brand-azul/10 text-brand-azul"
                  />
                  <AccesoRapido
                    href="/cliente/celebraciones/solicitar"
                    icon={PartyPopper}
                    label="Solicitar evento"
                    color="bg-brand-rosa/10 text-brand-rosa"
                  />
                  <AccesoRapido
                    href="/cliente/mis-reservas"
                    icon={CalendarDays}
                    label="Mis reservas"
                    color="bg-gray-100 text-gray-600"
                  />
                  <AccesoRapido
                    href="/cliente/mi-cuenta"
                    icon={User}
                    label="Mi cuenta"
                    color="bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-1">
                  ¿Necesitas ayuda?
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Escríbenos y te respondemos rápido.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      <ReservaDetalleDialog
        reserva={reservaDetalle}
        open={!!reservaDetalle}
        onClose={() => setReservaDetalle(null)}
      />
    </div>
  )
}
