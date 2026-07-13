import Image from 'next/image'
import { AlertTriangle, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'

interface ReservaCardProps {
  reserva: Reserva
  onVerDetalle: () => void
  onPagarAhora?: () => void
}

export function ReservaCard({
  reserva,
  onVerDetalle,
  onPagarAhora,
}: ReservaCardProps) {
  const rechazado =
    reserva.estado === 'PENDIENTE' &&
    !reserva.referenciaPago &&
    !!reserva.motivoRechazoPago
  const faltaPagar =
    reserva.estado === 'PENDIENTE' && !reserva.referenciaPago && !rechazado
  const enRevision = reserva.estado === 'PENDIENTE' && !!reserva.referenciaPago

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow flex flex-col">
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs text-gray-400 truncate">
            {reserva.numeroTicket}
          </p>
          <EstadoBadge estado={reserva.estado} compact />
        </div>

        <div className="space-y-0.5">
          <p className="text-sm font-bold text-gray-900">
            {formatDate(reserva.fechaEvento, "EEEE d 'de' MMMM")}
          </p>
          <p className="text-xs text-gray-500">
            Visita de {reserva.nombreNino} · {reserva.edadNino} años
          </p>
        </div>

        <p className="text-lg font-black text-gray-900">
          {formatCurrency(reserva.totalPagado)}
        </p>

        {(faltaPagar || rechazado) && onPagarAhora && (
          <button
            onClick={onPagarAhora}
            className="flex items-center justify-center gap-1.5 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl px-2.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          >
            {rechazado ? (
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Image
                src="/metodo-pago-yape.png"
                alt=""
                width={14}
                height={14}
                className="rounded-sm shrink-0"
              />
            )}
            {rechazado ? 'Comprobante rechazado, reintentar' : 'Pagar ahora'}
          </button>
        )}

        {enRevision && (
          <div className="flex items-center gap-1.5 bg-brand-azul/5 border border-brand-azul/20 rounded-lg px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-brand-azul shrink-0" />
            <p className="text-[11px] text-brand-azul/90 leading-tight">
              Comprobante en revisión
            </p>
          </div>
        )}

        <button
          onClick={onVerDetalle}
          className="mt-auto w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40 focus-visible:ring-offset-1"
        >
          Ver detalle
        </button>
      </div>
    </div>
  )
}
