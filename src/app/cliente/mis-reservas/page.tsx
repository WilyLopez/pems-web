'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  Ticket,
  CalendarDays,
  Clock,
  QrCode,
  AlertCircle,
  User,
  ChevronDown,
} from 'lucide-react'

import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/types/reserva.types'
import { EstadoReserva } from '@/types/enums'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/common/Statusbadge'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

function TicketCard({ reserva }: { reserva: Reserva }) {
  const activa = [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE].includes(
    reserva.estado as EstadoReserva
  )

  return (
    <Card className={`overflow-hidden border shadow-card transition-all ${activa ? 'border-brand-azul/20 ring-1 ring-brand-azul/10' : 'border-gray-100'}`}>
      <div className={`h-1.5 ${activa ? 'bg-brand-azul' : 'bg-gray-200'}`} />
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 self-start ${activa ? 'bg-brand-azul/10' : 'bg-gray-100'}`}>
            <QrCode className={`h-8 w-8 ${activa ? 'text-brand-azul' : 'text-gray-300'}`} />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-gray-900">
                {reserva.numeroTicket}
              </span>
              <StatusBadge status={reserva.estado} />
              {reserva.esReprogramacion && (
                <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                  Reprogramada
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand-azul" />
                {formatDate(reserva.fechaEvento)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-rosa" />
                {reserva.nombreNino} ({reserva.edadNino} años)
              </span>
            </div>

            <span className="text-sm font-bold text-brand-azul">
              {formatCurrency(reserva.totalPagado)}
            </span>
          </div>
        </div>

        {reserva.estado === EstadoReserva.PENDIENTE && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Pago pendiente. Presenta este ticket en caja para confirmar tu ingreso.
          </div>
        )}

        {reserva.estado === EstadoReserva.PENDIENTE &&
          reserva.medioPago === 'YAPE' &&
          !reserva.referenciaPago && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-amber-800">
                Pago Yape pendiente de validacion
              </p>
              <p className="text-xs text-amber-700">
                Si ya realizaste el pago, sube el comprobante para agilizar la confirmacion.
              </p>
              <input
                type="file"
                accept="image/*"
                className="text-xs w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 cursor-pointer"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    await reservaService.subirComprobante(reserva.id, file)
                    toast.success('Comprobante enviado. Nuestro equipo lo verificara pronto.')
                  } catch {
                    toast.error('No se pudo subir el comprobante. Intenta nuevamente.')
                  }
                }}
              />
            </div>
          )}

        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs font-semibold text-brand-azul hover:underline flex items-center gap-1 list-none">
            <QrCode className="h-3.5 w-3.5" />
            Ver codigo QR
            <ChevronDown className="h-3.5 w-3.5 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="mt-3 flex flex-col items-center gap-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reserva.numeroTicket)}`}
              alt={`QR del ticket ${reserva.numeroTicket}`}
              className="rounded-xl border border-gray-200"
              width={150}
              height={150}
            />
            <p className="text-xs font-mono text-gray-400">{reserva.numeroTicket}</p>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-0 shadow-card">
      <div className="h-1.5 bg-gray-100" />
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MisReservasPage() {
  const { data: session } = useSession()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mis-reservas', session?.user?.id],
    queryFn: () => reservaService.listar({ page: 0, size: 30 }),
    enabled: !!session?.user?.id,
  })

  const proximas =
    data?.content.filter((r: Reserva) =>
      [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE].includes(
        r.estado as EstadoReserva
      )
    ) ?? []

  const historial =
    data?.content.filter((r: Reserva) =>
      [EstadoReserva.COMPLETADA, EstadoReserva.CANCELADA, EstadoReserva.REPROGRAMADA].includes(
        r.estado as EstadoReserva
      )
    ) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Mis reservas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tus tickets de acceso a Kiki y Lala</p>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-1.5"
        >
          <Link href="/reservar">
            <Ticket className="h-4 w-4" />
            Nueva reserva
          </Link>
        </Button>
      </div>

      {isError && <ErrorState onRetry={refetch} />}

      <Tabs defaultValue="proximas">
        <TabsList className="bg-gray-100 rounded-xl h-10">
          <TabsTrigger value="proximas" className="rounded-lg text-sm font-semibold gap-1.5">
            <Ticket className="h-4 w-4" />
            Próximas
            {proximas.length > 0 && (
              <Badge className="bg-brand-azul text-white h-5 px-1.5 text-xs ml-1">
                {proximas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historial" className="rounded-lg text-sm font-semibold gap-1.5">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proximas" className="mt-4 space-y-3">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          {!isLoading && proximas.length === 0 && (
            <EmptyState
              icon={<Ticket className="h-7 w-7" />}
              title="No tienes reservas próximas"
              description="Compra tus entradas para visitar Kiki y Lala."
              action={
                <Button asChild className="bg-brand-azul text-white rounded-full gap-2">
                  <Link href="/reservar">
                    <Ticket className="h-4 w-4" />
                    Reservar ahora
                  </Link>
                </Button>
              }
            />
          )}
          {proximas.map((r: Reserva) => <TicketCard key={r.id} reserva={r} />)}
        </TabsContent>

        <TabsContent value="historial" className="mt-4 space-y-3">
          {isLoading && Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
          {!isLoading && historial.length === 0 && (
            <EmptyState
              icon={<Clock className="h-7 w-7" />}
              title="Sin historial aún"
              description="Aquí aparecerán tus visitas anteriores a Kiki y Lala."
            />
          )}
          {historial.map((r: Reserva) => <TicketCard key={r.id} reserva={r} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
