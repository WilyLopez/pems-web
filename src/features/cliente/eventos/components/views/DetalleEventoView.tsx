'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import {
  PartyPopper,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  ChevronLeft,
  FileText,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import Link from 'next/link'

import { useDetalleEventoData } from '../../hooks/useMisEventosData'
import { useWhatsAppUrl } from '@/hooks/useConfigPublica'
import { ErrorState } from '@/components/common/Errorstate'
import { StatusBadge } from '@/components/common/Statusbadge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency } from '@/lib/utils'

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  )
}

export function DetalleEventoView() {
  const params  = useParams()
  const id      = Number(params.id)
  const { nombre } = useAuth()

  const { data: evento, isLoading, isError } = useDetalleEventoData(id)

  const mensaje = evento
    ? `Hola, soy ${nombre ?? 'cliente'}. Tengo una consulta sobre mi evento del ${formatDate(evento.fechaEvento)} (ID: EVT-${evento.id})`
    : 'Hola, tengo una consulta sobre mi evento privado'
  const whatsappUrl = useWhatsAppUrl(mensaje)

  if (isLoading) return <PageSkeleton />
  if (isError || !evento) return <ErrorState message="No se encontró el evento." />

  const diasRestantes = evento.estado === 'CONFIRMADA'
    ? differenceInDays(startOfDay(parseISO(evento.fechaEvento)), startOfDay(new Date()))
    : null

  const mostrarRecordatorio = diasRestantes !== null && diasRestantes >= 0 && diasRestantes <= 7
  const tieneContrato       = ['CONFIRMADA', 'COMPLETADA'].includes(evento.estado)
  const saldoPendiente      = evento.montoSaldo && evento.montoSaldo > 0

  const porcentajePagado =
    evento.precioTotalContrato && evento.montoAdelanto
      ? Math.min(Math.round((evento.montoAdelanto / evento.precioTotalContrato) * 100), 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-gray-500 hover:text-brand-rosa gap-1.5 -ml-2"
          asChild
        >
          <Link href="/cliente/mis-eventos">
            <ChevronLeft className="h-4 w-4" />
            Mis eventos
          </Link>
        </Button>

        <div className="flex flex-wrap items-start gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{evento.tipoEvento}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{formatDate(evento.fechaEvento)}</p>
          </div>
          <StatusBadge status={evento.estado} />
        </div>
      </div>

      {mostrarRecordatorio && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {diasRestantes === 0
                ? '¡Tu evento es hoy!'
                : `Tu evento es en ${diasRestantes} días!`}
            </p>
            {saldoPendiente && (
              <p className="text-xs text-amber-700 mt-0.5">
                Saldo pendiente:{' '}
                <span className="font-semibold">{formatCurrency(evento.montoSaldo!)}</span>.
                Coordina el pago con el equipo de Kiki y Lala.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border border-gray-100 shadow-card rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center">
                <PartyPopper className="h-4 w-4 text-brand-rosa" />
              </div>
              Detalles del evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-brand-azul" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha</p>
                  <p className="font-semibold text-gray-900">{formatDate(evento.fechaEvento)}</p>
                </div>
              </div>

              {evento.horaInicio && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-azul/10 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-brand-azul" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Horario</p>
                    <p className="font-semibold text-gray-900">
                      {evento.turno} · {evento.horaInicio} – {evento.horaFin}
                    </p>
                  </div>
                </div>
              )}

              {evento.aforoDeclarado && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-amarillo/20 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Invitados</p>
                    <p className="font-semibold text-gray-900">{evento.aforoDeclarado} personas</p>
                  </div>
                </div>
              )}
            </div>

            {evento.extras && evento.extras.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">Extras solicitados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {evento.extras.map((ex) => (
                      <span key={ex.id} className="text-xs bg-brand-rosa/10 text-brand-rosa px-2 py-0.5 rounded-full font-medium">
                        {ex.nombreExtra ?? ex.nombreLibre}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {evento.observaciones && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1">Observaciones</p>
                  <p className="text-sm text-gray-600">{evento.observaciones}</p>
                </div>
              </>
            )}

            {tieneContrato && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="font-semibold">Contrato generado.</span>
                  <span className="text-xs text-green-600">El equipo te enviará el documento para firmar.</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {tieneContrato && evento.precioTotalContrato ? (
            <Card className="border border-gray-100 shadow-card rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Resumen de pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total contrato</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(evento.precioTotalContrato)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Adelanto pagado</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(evento.montoAdelanto ?? 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Pagado</span>
                    <span>{porcentajePagado}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-azul transition-all"
                      style={{ width: `${porcentajePagado}%` }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Saldo pendiente</span>
                  <span className={`text-lg font-black ${saldoPendiente ? 'text-amber-600' : 'text-green-600'}`}>
                    {formatCurrency(evento.montoSaldo ?? 0)}
                  </span>
                </div>

                {saldoPendiente && (
                  <p className="text-xs text-gray-400">
                    El saldo debe ser cancelado el día del evento o según lo acordado.
                  </p>
                )}

                {!saldoPendiente && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Pago completado
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-gray-100 shadow-card rounded-2xl">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-sm font-semibold text-gray-900">Solicitud en revisión</p>
                <p className="text-xs text-gray-400 mt-1">
                  El precio y contrato se confirman cuando el equipo aprueba la solicitud.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border border-brand-rosa/20 rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-rosa" />
                <p className="text-xs font-bold text-gray-700">¿Necesitas ayuda?</p>
              </div>
              <p className="text-xs text-gray-400">
                Contáctanos directamente por WhatsApp para consultas sobre tu evento.
              </p>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-full border border-green-300 text-green-700 hover:bg-green-50 text-xs font-semibold py-2 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contactar por WhatsApp
                </a>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
