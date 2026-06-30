'use client'

import React, { useState } from 'react'
import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  X,
  Ticket,
  User,
  CalendarDays,
  XCircle,
  CreditCard,
  Mail,
  LogIn,
  Clock,
  ImageOff,
  ZoomIn,
  ShieldCheck,
} from 'lucide-react'
import { Reserva } from '../../types'
import { Button } from '@/components/ui/Button'
import { formatDateTime, formatCurrency } from '@/lib/utils'
import { ReservaStatusBadge } from '../shared/ReservaStatusBadge'
import { reservaHelpers } from '../../utils/reserva-helpers'

interface ReservaDrawerProps {
  reserva: Reserva | null
  onClose: () => void
  onValidarYape?: (id: number) => void
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null | React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <div className="text-sm text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export const ReservaDrawer = React.memo(
  ({ reserva, onClose, onValidarYape }: ReservaDrawerProps) => {
    if (!reserva) return null


    const esYapePendiente = reservaHelpers.needsYapeValidation(reserva)
    const tieneComprobante =
      reserva.referenciaPago && reserva.referenciaPago.startsWith('http')

    return (
      <>
        <div className="fixed inset-0 z-[40]" onClick={onClose} />

        <aside className="fixed right-0 top-0 z-[50] h-full w-[380px] max-w-full bg-gray-50 shadow-2xl flex flex-col animate-slide-in border-l border-gray-100">
          <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-brand-azul" />
                <h2 className="font-black text-gray-900 font-mono text-sm">
                  {reserva.numeroTicket}
                </h2>
              </div>
              <div className="mt-1.5">
                <ReservaStatusBadge
                  estado={reserva.estado}
                  ingresado={reserva.ingresado}
                  esReprogramacion={reserva.esReprogramacion}
                  fechaEvento={reserva.fechaEvento}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-2xl p-4 text-center">
              <p className="text-xs text-brand-azul font-bold uppercase tracking-wide">
                Fecha del evento
              </p>
              <p className="text-xl font-black text-brand-azul mt-1 capitalize">
                {format(
                  parseISO(reserva.fechaEvento),
                  "EEEE d 'de' MMMM yyyy",
                  {
                    locale: es,
                  }
                )}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
                Nino registrado
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center text-lg font-black text-brand-rosa shrink-0">
                  {reserva.nombreNino.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-gray-900 truncate">
                    {reserva.nombreNino}
                  </p>
                  <p className="text-xs text-gray-400">
                    {reserva.edadNino} anos de edad
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 divide-y divide-gray-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 pb-1">
                Informacion
              </p>
              <Row icon={User} label="Cliente" value={reserva.nombreCliente} />
              <Row icon={Mail} label="Correo" value={reserva.correoCliente} />
              <Row
                icon={User}
                label="Acompanante"
                value={reserva.nombreAcompanante}
              />
              <Row
                icon={CalendarDays}
                label="Tipo de dia"
                value={
                  reserva.tipoDia === 'FIN_SEMANA_FERIADO'
                    ? 'Fin de Semana / Feriado'
                    : reserva.tipoDia === 'SEMANA'
                      ? 'Dia de Semana'
                      : reserva.tipoDia
                }
              />
              <Row
                icon={Ticket}
                label="Canal"
                value={
                  reserva.canalReserva === 'MOSTRADOR'
                    ? 'Caja'
                    : reserva.canalReserva === 'WEB'
                      ? 'Web'
                      : reserva.canalReserva
                }
              />
              {reserva.esReprogramacion && (
                <Row
                  icon={CalendarDays}
                  label="Reprogramaciones"
                  value={`${reserva.vecesReprogramada} vez(es)`}
                />
              )}
              <Row
                icon={Clock}
                label="Creado el"
                value={formatDateTime(reserva.fechaCreacion)}
              />
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 divide-y divide-gray-50">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 pb-1">
                Estado financiero
              </p>
              <Row
                icon={CreditCard}
                label="Total pagado"
                value={
                  <span className="font-black text-green-600 text-lg">
                    {formatCurrency(reserva.totalPagado)}
                  </span>
                }
              />
              <Row
                icon={Ticket}
                label="Medio de pago"
                value={reserva.medioPago}
              />
              {reserva.descuentoAplicado > 0 && (
                <Row
                  icon={Ticket}
                  label="Descuento"
                  value={
                    <span className="text-red-500 font-semibold">
                      -{formatCurrency(reserva.descuentoAplicado)}
                    </span>
                  }
                />
              )}
            </div>

            {(tieneComprobante || esYapePendiente) && (
              <div
                className={`bg-white rounded-2xl border p-4 space-y-3 ${
                  esYapePendiente
                    ? 'border-amber-200'
                    : 'border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      esYapePendiente ? 'text-amber-600' : 'text-green-600'
                    }`}
                  >
                    Comprobante Yape
                  </p>
                  {esYapePendiente && onValidarYape && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onValidarYape(reserva.id)}
                      className="h-7 px-3 text-xs font-bold rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                      Validar pago
                    </Button>
                  )}
                </div>

                {tieneComprobante ? (
                  <a
                    href={reserva.referenciaPago!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative w-full block group rounded-xl overflow-hidden border border-gray-200 hover:border-amber-400 transition-colors"
                  >
                    <img
                      src={reserva.referenciaPago!}
                      alt="Comprobante de pago Yape"
                      className="w-full max-h-48 object-contain bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                    </div>
                  </a>

                ) : (
                  <div className="flex flex-col items-center gap-2 py-6 rounded-xl border border-dashed border-gray-200 bg-gray-50">
                    <ImageOff className="h-6 w-6 text-gray-300" />
                    <p className="text-xs text-gray-400 font-medium">
                      Sin comprobante adjunto
                    </p>
                  </div>
                )}
              </div>
            )}

            {reserva.ingresado && reserva.fechaIngreso && (
              <div className="bg-white border border-green-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-green-600 mb-1">
                  Control de acceso
                </p>
                <Row
                  icon={LogIn}
                  label="Hora de ingreso"
                  value={
                    <span className="text-green-700 font-medium">
                      {formatDateTime(reserva.fechaIngreso)}
                    </span>
                  }
                />
              </div>
            )}

            {reserva.estado === 'CANCELADA' && reserva.motivoCancelacion && (
              <div className="bg-white border border-red-200 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-2">
                  Motivo de cancelacion
                </p>
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-800">
                    {reserva.motivoCancelacion}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

      </>
    )
  }
)


ReservaDrawer.displayName = 'ReservaDrawer'
