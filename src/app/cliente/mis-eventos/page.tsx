'use client'

import { useSession } from 'next-auth/react'
import { useEventos } from '@/hooks/useEventos'
import { EventoPrivado } from '@/types/evento.types'
import { StatusBadge } from '@/components/common/Statusbadge'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PartyPopper, Calendar, Clock, Users } from 'lucide-react'
import Link from 'next/link'

function EventoCard({ evento }: { evento: EventoPrivado }) {
  const tieneContrato = ['CONFIRMADA', 'COMPLETADA'].includes(evento.estado)
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-3 self-start">
            <PartyPopper className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{evento.tipoEvento}</h3>
              <StatusBadge status={evento.estado} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(evento.fechaEvento)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {evento.turno} · {evento.horaInicio} – {evento.horaFin}
              </span>
              {evento.aforoDeclarado && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {evento.aforoDeclarado} invitados
                </span>
              )}
            </div>
            {evento.precioTotalContrato && (
              <div className="flex flex-wrap gap-4 text-sm pt-1">
                <span>
                  Total:{' '}
                  <span className="font-semibold">
                    {formatCurrency(evento.precioTotalContrato)}
                  </span>
                </span>
                {evento.montoAdelanto !== undefined &&
                  evento.montoAdelanto > 0 && (
                    <span className="text-muted-foreground">
                      Adelanto: {formatCurrency(evento.montoAdelanto)}
                    </span>
                  )}
                {evento.montoSaldo !== undefined && evento.montoSaldo > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 text-xs"
                  >
                    Saldo pendiente: {formatCurrency(evento.montoSaldo)}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EventoCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}

export default function MisEventosPage() {
  const { data: session } = useSession()
  const { data, isLoading, isError, refetch } = useEventos({
    page: 0,
    size: 20,
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Mis eventos privados"
        description="Solicitudes y eventos privados que has organizado"
        actions={
          <Button asChild size="sm">
            <Link href="/eventos-privados">Solicitar evento</Link>
          </Button>
        }
      />

      {isError && <ErrorState onRetry={refetch} />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading &&
        !isError &&
        ((data?.content.length ?? 0) === 0 ? (
          <EmptyState
            icon={<PartyPopper className="h-6 w-6" />}
            title="Sin eventos aún"
            description="Aún no tienes eventos privados. ¡Organiza el próximo cumpleaños de tu hijo con nosotros!"
            action={
              <Button asChild>
                <Link href="/eventos-privados">Solicitar evento</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {data?.content.map((e) => (
              <EventoCard key={e.id} evento={e} />
            ))}
          </div>
        ))}
    </div>
  )
}
