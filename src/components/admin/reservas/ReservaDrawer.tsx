'use client'

import { parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  X,
  Ticket,
  User,
  CalendarDays,
  CheckCircle2,
  XCircle,
  CreditCard,
  Phone,
  Mail,
  LogIn,
  Clock,
} from 'lucide-react'
import { Reserva } from '@/types/reserva.types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

interface ReservaDrawerProps {
  reserva: Reserva | null
  onClose: () => void
}

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  REPROGRAMADA: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETADA: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELADA: 'bg-red-100 text-red-700 border-red-200',
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

export function ReservaDrawer({ reserva, onClose }: ReservaDrawerProps) {
  if (!reserva) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-[380px] bg-gray-50 shadow-2xl flex flex-col">
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-brand-azul" />
              <h2 className="font-black text-gray-900 font-mono text-sm">
                {reserva.numeroTicket}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn('text-[10px]', ESTADO_BADGE[reserva.estado])}
              >
                {reserva.estado}
              </Badge>
              {reserva.ingresado && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Ingresado
                </span>
              )}
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

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-2xl p-4 text-center">
            <p className="text-xs text-brand-azul font-bold uppercase tracking-wide">
              Fecha del evento
            </p>
            <p className="text-xl font-black text-brand-azul mt-1">
              {format(parseISO(reserva.fechaEvento), "EEEE d 'de' MMMM yyyy", {
                locale: es,
              })}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
              Nino registrado
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center text-lg font-black text-brand-rosa">
                {reserva.nombreNino.charAt(0)}
              </div>
              <div>
                <p className="font-black text-gray-900">{reserva.nombreNino}</p>
                <p className="text-xs text-gray-400">
                  {reserva.edadNino} anos de edad
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
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
              value={reserva.tipoDia}
            />
            <Row icon={Ticket} label="Canal" value={reserva.canalReserva} />
            {reserva.esReprogramacion && (
              <Row
                icon={Clock}
                label="Reprogramacion"
                value={`${reserva.vecesReprogramada} vez/veces`}
              />
            )}
            {reserva.ingresado && reserva.fechaIngreso && (
              <Row
                icon={LogIn}
                label="Hora de ingreso"
                value={format(parseISO(reserva.fechaIngreso), 'HH:mm')}
              />
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
              Pago
            </p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Total pagado</p>
                <p className="text-xl font-black text-green-700">
                  {formatCurrency(reserva.totalPagado)}
                </p>
              </div>
              {reserva.medioPago && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 border-green-200 text-xs font-bold"
                >
                  {reserva.medioPago}
                </Badge>
              )}
            </div>
            {reserva.descuentoAplicado > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Descuento: {formatCurrency(reserva.descuentoAplicado)}
              </p>
            )}
            {reserva.referenciaPago && (
              <p className="text-xs font-mono text-gray-400 mt-1">
                {reserva.referenciaPago}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
            {reserva.firmoConsentimiento ? (
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400 shrink-0" />
            )}
            <p className="text-xs text-gray-600 font-semibold">
              {reserva.firmoConsentimiento
                ? 'Consentimiento informado firmado'
                : 'Consentimiento no firmado'}
            </p>
          </div>

          {reserva.motivoCancelacion && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs font-bold text-red-700">
                Motivo de cancelación
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                {reserva.motivoCancelacion}
              </p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            Registrada el {formatDate(reserva.fechaCreacion)}
          </p>
        </div>
      </aside>
    </>
  )
}
