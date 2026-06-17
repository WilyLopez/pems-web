'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  Plus,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

import { eventoService } from '@/services/evento.service'
import { EventoPrivado } from '@/types/evento.types'
import { ErrorState } from '@/components/common/Errorstate'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { EstadoBadge } from '@/components/cliente/EstadoBadge'

function EventoCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex gap-4">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
    </div>
  )
}

function EventoCard({ evento }: { evento: EventoPrivado }) {
  const hoy = startOfDay(new Date())
  const diasRestantes = differenceInDays(
    startOfDay(parseISO(evento.fechaEvento)),
    hoy
  )
  const cercano =
    evento.estado === 'CONFIRMADA' && diasRestantes >= 0 && diasRestantes <= 7

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-brand-rosa/30 transition-colors overflow-hidden">
      <div className="h-1 bg-brand-rosa" />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0">
              <PartyPopper className="h-5 w-5 text-brand-rosa" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 truncate">{evento.tipoEvento}</p>
              <EstadoBadge estado={evento.estado} compact />
            </div>
          </div>
          <Link
            href={`/cliente/mis-eventos/${evento.id}`}
            className="shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-brand-azul"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {cercano && (
          <div className="flex items-center gap-2 bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-brand-rosa shrink-0" />
            <p className="text-xs font-semibold text-brand-rosa">
              {diasRestantes === 0 ? 'Tu evento es hoy' : `Faltan ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(evento.fechaEvento)}
          </span>
          {evento.horaInicio && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {evento.horaInicio} – {evento.horaFin}
            </span>
          )}
          {evento.aforoDeclarado && (
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {evento.aforoDeclarado} invitados
            </span>
          )}
        </div>

        {evento.precioTotalContrato && (
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-gray-900">
              {formatCurrency(evento.precioTotalContrato)}
            </span>
            {evento.montoSaldo && evento.montoSaldo > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 text-xs"
              >
                Saldo: {formatCurrency(evento.montoSaldo)}
              </Badge>
            )}
          </div>
        )}

        <Link
          href={`/cliente/mis-eventos/${evento.id}`}
          className="flex items-center justify-center w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-rosa/40 hover:text-brand-rosa transition-all"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  )
}

export default function MisEventosPage() {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mis-eventos-cliente'],
    queryFn: () => eventoService.listar({ page: 0, size: 30 }),
    enabled: isAuthenticated,
  })

  const todos: EventoPrivado[] = data?.content ?? []
  const confirmados = todos.filter((e) => e.estado === 'CONFIRMADA')
  const solicitudes = todos.filter((e) => e.estado === 'SOLICITADA')
  const historial = todos.filter((e) =>
    ['COMPLETADA', 'CANCELADA'].includes(e.estado)
  )

  const proximosConRecordatorio = useMemo(() => {
    const hoy = startOfDay(new Date())
    return confirmados.filter((e) => {
      const diff = differenceInDays(startOfDay(parseISO(e.fechaEvento)), hoy)
      return diff >= 0 && diff <= 7
    })
  }, [confirmados])

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Mis eventos privados</h1>
          <p className="text-sm text-gray-500">Solicitudes y eventos organizados</p>
        </div>
        <Link
          href="/eventos-privados"
          className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Solicitar evento</span>
          <span className="sm:hidden">Solicitar</span>
        </Link>
      </div>

      {isError && <ErrorState onRetry={refetch} />}

      {proximosConRecordatorio.length > 0 && (
        <div className="space-y-2">
          {proximosConRecordatorio.map((e) => {
            const dias = differenceInDays(
              startOfDay(parseISO(e.fechaEvento)),
              startOfDay(new Date())
            )
            return (
              <div
                key={e.id}
                className="rounded-2xl bg-gradient-to-r from-brand-rosa/10 to-brand-azul/10 border border-brand-rosa/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-rosa/15 flex items-center justify-center shrink-0">
                  <PartyPopper className="h-5 w-5 text-brand-rosa" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    Tu evento privado es en{' '}
                    {dias === 0 ? '¡hoy!' : `${dias} día${dias !== 1 ? 's' : ''}!`}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {e.tipoEvento} · {formatDate(e.fechaEvento)}
                    {e.montoSaldo && e.montoSaldo > 0 ? (
                      <span className="ml-2 text-amber-700 font-semibold">
                        · Saldo pendiente: {formatCurrency(e.montoSaldo)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <Link
                  href={`/cliente/mis-eventos/${e.id}`}
                  className="shrink-0 flex items-center gap-1 px-3 py-2 bg-brand-rosa text-white rounded-xl text-xs font-bold hover:bg-brand-rosa/90 transition-colors"
                >
                  Ver detalles
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )
          })}
        </div>
      )}

      <Tabs defaultValue="confirmados">
        <TabsList className="bg-gray-100 rounded-xl h-10">
          <TabsTrigger value="confirmados" className="rounded-lg text-sm font-semibold gap-1.5">
            <PartyPopper className="h-4 w-4" />
            Confirmados
            {confirmados.length > 0 && (
              <Badge className="bg-brand-rosa text-white h-5 px-1.5 text-xs ml-1">
                {confirmados.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="rounded-lg text-sm font-semibold gap-1.5">
            <Clock className="h-4 w-4" />
            Solicitudes
            {solicitudes.length > 0 && (
              <Badge className="bg-amber-500 text-white h-5 px-1.5 text-xs ml-1">
                {solicitudes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historial" className="rounded-lg text-sm font-semibold">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="confirmados" className="mt-4">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
            </div>
          )}
          {!isLoading && confirmados.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4 px-4">
              <div className="w-14 h-14 bg-brand-rosa/10 rounded-2xl flex items-center justify-center">
                <PartyPopper className="h-7 w-7 text-brand-rosa" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Sin eventos confirmados</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  ¿Quieres celebrar algo especial? Solicita tu evento privado.
                </p>
              </div>
              <Link
                href="/eventos-privados"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Solicitar evento
              </Link>
            </div>
          )}
          {!isLoading && confirmados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {confirmados.map((e) => <EventoCard key={e.id} evento={e} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="solicitudes" className="mt-4">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
            </div>
          )}
          {!isLoading && solicitudes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-4 px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Sin solicitudes pendientes</p>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  Te notificaremos cuando tu solicitud sea revisada.
                </p>
              </div>
              <Link
                href="/eventos-privados"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Solicitar evento
              </Link>
            </div>
          )}
          {!isLoading && solicitudes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  En revisión. Te contactaremos en 24-48 horas con la cotización.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solicitudes.map((e) => <EventoCard key={e.id} evento={e} />)}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="historial" className="mt-4">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
            </div>
          )}
          {!isLoading && historial.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 gap-3 px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">Sin historial aún</p>
                <p className="text-sm text-gray-500 mt-1">
                  Aquí aparecerán tus eventos pasados.
                </p>
              </div>
            </div>
          )}
          {!isLoading && historial.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {historial.map((e) => <EventoCard key={e.id} evento={e} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
