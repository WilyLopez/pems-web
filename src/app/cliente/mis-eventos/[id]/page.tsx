'use client'

import { useParams } from 'next/navigation'
import { useEventos } from '@/hooks/useEventos'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorState } from '@/components/common/Errorstate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/common/Statusbadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Calendar, Clock, Users, PartyPopper, FileText } from 'lucide-react'

export default function DetalleEventoPage() {
  const { id } = useParams()
  // Asumiendo que useEventos puede recibir un id o que hay un hook similar para detalle
  const { data: eventos } = useEventos({ page: 0, size: 100 })
  const evento = eventos?.content.find((e) => e.id === Number(id))
  const isLoading = !eventos

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!evento) {
    return <ErrorState message="No se encontr├│ la informaci├│n del evento." />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Evento: ${evento.tipoEvento}`}
        description="Consulta los detalles y el estado de tu reserva"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              Detalles del Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Fecha
                  </p>
                  <p className="font-semibold">
                    {formatDate(evento.fechaEvento)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Turno y Horario
                  </p>
                  <p className="font-semibold">
                    {evento.turno}: {evento.horaInicio} - {evento.horaFin}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Invitados
                  </p>
                  <p className="font-semibold">
                    {evento.aforoDeclarado ?? 'No especificado'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-fit">
                  Estado
                </Badge>
                <StatusBadge status={evento.estado} />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informaci├│n Adicional
              </h4>
              <p className="text-sm text-muted-foreground">
                {evento.observaciones || 'Sin observaciones adicionales.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Contrato</span>
              <span className="font-semibold">
                {formatCurrency(evento.precioTotalContrato || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Monto Adelanto</span>
              <span className="font-semibold">
                {formatCurrency(evento.montoAdelanto || 0)}
              </span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-bold">Saldo Pendiente</span>
              <span className="font-bold text-lg text-primary">
                {formatCurrency(evento.montoSaldo || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
