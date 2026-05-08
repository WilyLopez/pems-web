'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Ticket, Calendar, User, AlertCircle } from 'lucide-react'

import { reservaService } from '@/services/reserva.service'
import { Reserva } from '@/types/reserva.types'
import { EstadoReserva } from '@/types/enums'
import { StatusBadge } from '@/components/common/Statusbadge'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

function ReservaCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

function ReservaCard({ reserva }: { reserva: Reserva }) {
  const cancelable = [EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA].includes(
    reserva.estado as EstadoReserva
  )

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold">{reserva.numeroTicket}</span>
              <StatusBadge status={reserva.estado} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(reserva.fechaEvento)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {reserva.nombreNino}, {reserva.edadNino} años
              </span>
            </div>
            <p className="text-sm font-medium">{formatCurrency(reserva.totalPagado)}</p>
          </div>

          {reserva.esReprogramacion && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md self-start">
              Reprogramada
            </span>
          )}
        </div>

        {!cancelable && reserva.estado === EstadoReserva.PENDIENTE && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Pendiente de confirmación de pago
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MisReservasPage() {
  const { data: session } = useSession()
  const idCliente = session?.user?.id ? parseInt(session.user.id) : 0

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['mis-reservas', idCliente],
    queryFn: () => reservaService.listar({ page: 0, size: 20 }),
    enabled: !!idCliente,
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mis reservas"
        description="Historial de tus reservas de acceso al local"
        actions={
          <Button asChild size="sm">
            <Link href="/reservar">Nueva reserva</Link>
          </Button>
        }
      />

      {isError && <ErrorState onRetry={refetch} />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <ReservaCardSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {(data?.content.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Ticket className="h-6 w-6" />}
              title="Sin reservas aún"
              description="Aún no tienes reservas registradas. Reserva tu primera visita."
              action={
                <Button asChild>
                  <Link href="/reservar">Reservar ahora</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {data?.content.map((r: Reserva) => <ReservaCard key={r.id} reserva={r} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}