import Image from 'next/image'
import { AlertTriangle, Download, Clock, AlertCircle } from 'lucide-react'
import { DialogTitle } from '@/components/ui/Dialog'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'

interface FilaDetalleProps {
  label: string
  valor: React.ReactNode
}

function FilaDetalle({ label, valor }: FilaDetalleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">
        {valor}
      </span>
    </div>
  )
}

export interface DetalleReservaProps {
  reserva: Reserva
  onReprogramar: () => void
  onCancelar: () => void
  onPagar: () => void
  puedeReprogramarAccion: boolean
  puedeCancelarAccion: boolean
  puedePagarAccion: boolean
}

export function DetalleReserva({
  reserva,
  onReprogramar,
  onCancelar,
  onPagar,
  puedeReprogramarAccion,
  puedeCancelarAccion,
  puedePagarAccion,
}: DetalleReservaProps) {
  const esActiva =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'

  // Solo reservas CONFIRMADA pueden reprogramarse (regla del backend: esReprogramable()).
  const esReprogramable = reserva.estado === 'CONFIRMADA'
  const puedeReprogramar =
    puedeReprogramarAccion && esReprogramable && reserva.vecesReprogramada === 0
  const yaUsoReprogramacion =
    puedeReprogramarAccion && esReprogramable && reserva.vecesReprogramada > 0
  const puedeCancelar = puedeCancelarAccion && esActiva
  const rechazado =
    puedePagarAccion &&
    reserva.estado === 'PENDIENTE' &&
    !reserva.referenciaPago &&
    !!reserva.motivoRechazoPago
  const faltaPagar =
    puedePagarAccion &&
    reserva.estado === 'PENDIENTE' &&
    !reserva.referenciaPago &&
    !rechazado
  const enRevision = reserva.estado === 'PENDIENTE' && !!reserva.referenciaPago

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <DialogTitle className="text-lg font-black text-gray-900">
          Detalle de reserva
        </DialogTitle>
      </div>

      <div className="flex flex-col items-center gap-2 py-6 bg-gray-50">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(reserva.numeroTicket)}`}
          alt={reserva.numeroTicket}
          className="rounded-2xl border border-gray-200 bg-white p-2"
          width={180}
          height={180}
        />
        <p className="font-mono text-sm font-bold text-gray-700">
          {reserva.numeroTicket}
        </p>
      </div>

      <div className="px-5 py-4 space-y-3">
        <FilaDetalle
          label="Estado"
          valor={<EstadoBadge estado={reserva.estado} />}
        />
        <FilaDetalle
          label="Fecha"
          valor={formatDate(reserva.fechaEvento, "d 'de' MMMM yyyy")}
        />
        <FilaDetalle
          label="Niño"
          valor={`${reserva.nombreNino} · ${reserva.edadNino} años`}
        />
        <FilaDetalle label="Acompañante" valor={reserva.nombreAcompanante} />
        {reserva.dniAcompanante && (
          <FilaDetalle label="DNI" valor={reserva.dniAcompanante} />
        )}
        <FilaDetalle
          label="Total"
          valor={
            <span className="font-black text-brand-azul">
              {formatCurrency(reserva.totalPagado)}
            </span>
          }
        />
        {reserva.medioPago && (
          <FilaDetalle label="Método de pago" valor={reserva.medioPago} />
        )}
      </div>

      {rechazado && (
        <div className="mx-5 mb-4 space-y-2">
          <div className="flex items-start gap-2 bg-brand-rosa/5 border border-brand-rosa/20 rounded-xl px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
            <p className="text-xs text-gray-700">
              <span className="font-bold">Tu comprobante fue rechazado.</span>{' '}
              {reserva.motivoRechazoPago}
            </p>
          </div>
          <button
            onClick={onPagar}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          >
            Volver a intentar
          </button>
        </div>
      )}

      {faltaPagar && (
        <div className="mx-5 mb-4">
          <button
            onClick={onPagar}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-rosa text-white rounded-xl text-sm font-bold hover:bg-brand-rosa/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa/50 focus-visible:ring-offset-1"
          >
            <Image
              src="/metodo-pago-yape.png"
              alt=""
              width={16}
              height={16}
              className="rounded-sm"
            />
            Pagar ahora con Yape
          </button>
        </div>
      )}

      {enRevision && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-brand-azul/5 border border-brand-azul/20 rounded-xl px-3 py-2.5">
          <Clock className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
          <p className="text-xs text-brand-azul/90">
            Tu comprobante está en revisión. Te avisaremos apenas se valide.
          </p>
        </div>
      )}

      {yaUsoReprogramacion && (
        <div className="mx-5 mb-4 flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <AlertCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Ya utilizaste tu reprogramación para esta reserva.
          </p>
        </div>
      )}

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-2">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/reservas/${reserva.id}/pdf`}
          download
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-brand-azul text-white rounded-xl text-sm font-bold hover:bg-brand-azul/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/50 focus-visible:ring-offset-1"
        >
          <Download className="h-4 w-4" />
          Descargar ticket PDF
        </a>
        {(puedeReprogramar || puedeCancelar) && (
          <div className="grid grid-cols-2 gap-2">
            {puedeReprogramar && (
              <button
                onClick={onReprogramar}
                className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
              >
                Reprogramar
              </button>
            )}
            {puedeCancelar && (
              <button
                onClick={onCancelar}
                className={cn(
                  'py-2.5 rounded-xl border text-sm font-semibold transition-all',
                  puedeReprogramar
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'col-span-2 border-red-200 text-red-600 hover:bg-red-50'
                )}
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
