// app/(cliente)/mis-entradas/page.tsx

'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import {
  Ticket,
  CalendarDays,
  Clock,
  QrCode,
  Download,
  AlertCircle,
} from 'lucide-react'
import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/types/reserva.types'
import { EstadoReserva } from '@/types/enums'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { StatusBadge } from '@/components/common/Statusbadge'
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
    <Card
      className={`overflow-hidden border-0 shadow-card hover:shadow-brand transition-all ${activa ? 'ring-1 ring-brand-azul/30' : ''}`}
    >
      <div className={`h-2 ${activa ? 'bg-brand-azul' : 'bg-gray-200'}`} />
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 self-start ${activa ? 'bg-brand-azul/10' : 'bg-gray-100'}`}
          >
            <QrCode
              className={`h-10 w-10 ${activa ? 'text-brand-azul' : 'text-gray-300'}`}
            />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-gray-900">
                {reserva.numeroTicket}
              </span>
              <StatusBadge status={reserva.estado} />
              {reserva.esReprogramacion && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-50 text-blue-700"
                >
                  Reprogramada
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-brand-azul" />
                {formatDate(reserva.fechaEvento)}
              </span>
              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-brand-rosa" />
                {reserva.nombreNino} ({reserva.edadNino} anos)
              </span>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-brand-azul">
                {formatCurrency(reserva.totalPagado)}
              </span>
              {activa && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs rounded-full gap-1 border-brand-azul/30 text-brand-azul"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar ticket
                </Button>
              )}
            </div>
          </div>
        </div>

        {reserva.estado === EstadoReserva.PENDIENTE && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Pendiente de pago. Presenta este codigo en caja para confirmar tu
            ingreso.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SkeletonTicket() {
  return (
    <Card className="overflow-hidden border-0 shadow-card">
      <div className="h-2 bg-gray-100" />
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MisEntradasPage() {
  const { data: session } = useSession()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mis-entradas', session?.user?.id],
    queryFn: () => reservaService.listar({ page: 0, size: 30 }),
    enabled: !!session?.user?.id,
  })

  const activas =
    data?.content.filter((r: Reserva) =>
      [EstadoReserva.CONFIRMADA, EstadoReserva.PENDIENTE].includes(
        r.estado as EstadoReserva
      )
    ) ?? []

  const pasadas =
    data?.content.filter((r: Reserva) =>
      [
        EstadoReserva.COMPLETADA,
        EstadoReserva.CANCELADA,
        EstadoReserva.REPROGRAMADA,
      ].includes(r.estado as EstadoReserva)
    ) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis entradas"
        description="Tus tickets de acceso a Kiki y Lala"
        actions={
          <Button
            asChild
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full gap-1.5"
          >
            <Link href="/zona-de-juegos">
              <Ticket className="h-4 w-4" />
              Comprar entradas
            </Link>
          </Button>
        }
      />

      {isError && <ErrorState onRetry={refetch} />}

      <Tabs defaultValue="activas">
        <TabsList className="bg-gray-100 rounded-xl h-10">
          <TabsTrigger
            value="activas"
            className="rounded-lg text-sm font-semibold gap-1.5"
          >
            <Ticket className="h-4 w-4" />
            Proximas
            {activas.length > 0 && (
              <Badge className="bg-brand-azul text-white h-5 px-1.5 text-xs ml-1">
                {activas.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="pasadas"
            className="rounded-lg text-sm font-semibold gap-1.5"
          >
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="mt-4 space-y-3">
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => <SkeletonTicket key={i} />)}
          {!isLoading && activas.length === 0 && (
            <EmptyState
              icon={<Ticket className="h-7 w-7" />}
              title="No tienes entradas proximas"
              description="Compra tus entradas para la proxima visita a Kiki y Lala."
              action={
                <Button
                  asChild
                  className="bg-brand-azul text-white rounded-full gap-2"
                >
                  <Link href="/zona-de-juegos">
                    <Ticket className="h-4 w-4" />
                    Comprar entradas
                  </Link>
                </Button>
              }
            />
          )}
          {activas.map((r: Reserva) => (
            <TicketCard key={r.id} reserva={r} />
          ))}
        </TabsContent>

        <TabsContent value="pasadas" className="mt-4 space-y-3">
          {isLoading &&
            Array.from({ length: 2 }).map((_, i) => <SkeletonTicket key={i} />)}
          {!isLoading && pasadas.length === 0 && (
            <EmptyState
              icon={<Clock className="h-7 w-7" />}
              title="Sin historial aun"
              description="Aqui apareceran tus visitas anteriores a Kiki y Lala."
            />
          )}
          {pasadas.map((r: Reserva) => (
            <TicketCard key={r.id} reserva={r} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
