'use client'

import { useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

import { eventoService } from '@/services/evento.service'
import { EventoPrivado } from '@/types/evento.types'
import { StatusBadge } from '@/components/common/Statusbadge'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDate, formatCurrency } from '@/lib/utils'

function ReminderBanner({ evento }: { evento: EventoPrivado }) {
  const dias = differenceInDays(
    startOfDay(parseISO(evento.fechaEvento)),
    startOfDay(new Date())
  )

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-bold text-amber-800">
          Tu evento es en {dias === 0 ? '¡hoy!' : `${dias} día${dias !== 1 ? 's' : ''}!`}
        </p>
        {evento.montoSaldo && evento.montoSaldo > 0 ? (
          <p className="text-xs text-amber-700 mt-0.5">
            Saldo pendiente: <span className="font-semibold">{formatCurrency(evento.montoSaldo)}</span>.
            Coordina el pago antes del evento.
          </p>
        ) : (
          <p className="text-xs text-amber-700 mt-0.5">
            {evento.tipoEvento} · {formatDate(evento.fechaEvento)}
          </p>
        )}
      </div>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-amber-400 text-amber-700 hover:bg-amber-100 rounded-full shrink-0"
      >
        <Link href={`/cliente/mis-eventos/${evento.id}`}>
          Ver <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  )
}

function EventoCard({ evento }: { evento: EventoPrivado }) {
  return (
    <Card className="hover:border-brand-rosa/30 transition-colors border border-gray-100 shadow-card rounded-2xl">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0 self-start">
            <PartyPopper className="h-5 w-5 text-brand-rosa" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-gray-900">{evento.tipoEvento}</h3>
              <StatusBadge status={evento.estado} />
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(evento.fechaEvento)}
              </span>
              {evento.horaInicio && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {evento.turno} · {evento.horaInicio} – {evento.horaFin}
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
              <div className="flex flex-wrap gap-3 text-sm pt-1">
                <span className="font-semibold text-gray-900">
                  {formatCurrency(evento.precioTotalContrato)}
                </span>
                {evento.montoSaldo && evento.montoSaldo > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                    Saldo: {formatCurrency(evento.montoSaldo)}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <Link
            href={`/cliente/mis-eventos/${evento.id}`}
            className="self-start text-xs text-brand-azul font-semibold hover:underline flex items-center gap-0.5 shrink-0"
          >
            Ver detalle <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function EventoCardSkeleton() {
  return (
    <Card className="border border-gray-100 shadow-card rounded-2xl">
      <CardContent className="p-5 space-y-3">
        <div className="flex gap-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MisEventosPage() {
  const { data: session } = useSession()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mis-eventos-cliente', session?.user?.id],
    queryFn: () => eventoService.listar({ page: 0, size: 30 }),
    enabled: !!session?.user?.id,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mis eventos privados</h1>
          <p className="text-sm text-gray-400 mt-0.5">Solicitudes y eventos organizados</p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full gap-1.5"
        >
          <Link href="/eventos-privados">
            <PartyPopper className="h-4 w-4" />
            Solicitar
          </Link>
        </Button>
      </div>

      {isError && <ErrorState onRetry={refetch} />}

      {proximosConRecordatorio.length > 0 && (
        <div className="space-y-2">
          {proximosConRecordatorio.map((e) => (
            <ReminderBanner key={e.id} evento={e} />
          ))}
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

        <TabsContent value="confirmados" className="mt-4 space-y-3">
          {isLoading && Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
          {!isLoading && confirmados.length === 0 && (
            <EmptyState
              icon={<PartyPopper className="h-7 w-7" />}
              title="Sin eventos confirmados"
              description="Tus eventos confirmados aparecerán aquí."
            />
          )}
          {confirmados.map((e) => <EventoCard key={e.id} evento={e} />)}
        </TabsContent>

        <TabsContent value="solicitudes" className="mt-4 space-y-3">
          {isLoading && Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
          {!isLoading && solicitudes.length === 0 && (
            <EmptyState
              icon={<Clock className="h-7 w-7" />}
              title="Sin solicitudes pendientes"
              description="Te notificaremos cuando tu solicitud sea revisada."
              action={
                <Button asChild className="bg-brand-rosa text-white rounded-full gap-2">
                  <Link href="/eventos-privados">
                    <PartyPopper className="h-4 w-4" />
                    Solicitar evento
                  </Link>
                </Button>
              }
            />
          )}
          {solicitudes.map((e) => <EventoCard key={e.id} evento={e} />)}
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-3">
          {isLoading && Array.from({ length: 2 }).map((_, i) => <EventoCardSkeleton key={i} />)}
          {!isLoading && historial.length === 0 && (
            <EmptyState
              icon={<Calendar className="h-7 w-7" />}
              title="Sin historial aún"
              description="Aquí aparecerán tus eventos pasados."
            />
          )}
          {historial.map((e) => <EventoCard key={e.id} evento={e} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
