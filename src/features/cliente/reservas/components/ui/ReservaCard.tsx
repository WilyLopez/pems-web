import { QrCode, AlertTriangle, Wallet, Clock } from 'lucide-react'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
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
  const activa =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'
  const faltaPagar = reserva.estado === 'PENDIENTE' && !reserva.referenciaPago
  const enRevision = reserva.estado === 'PENDIENTE' && !!reserva.referenciaPago

  return (
    <div
      className={cn(
        'bg-white rounded-3xl border overflow-hidden flex flex-col shadow-card hover:shadow-card-hover transition-shadow',
        activa ? 'border-brand-azul/20' : 'border-gray-100'
      )}
    >
      <div
        className={cn(
          'h-1.5',
          activa
            ? 'bg-gradient-to-r from-brand-azul to-brand-azul/60'
            : 'bg-gray-200'
        )}
      />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
              activa
                ? 'bg-gradient-to-br from-brand-azul/15 to-brand-rosa/10'
                : 'bg-gray-100'
            )}
          >
            <QrCode
              className={cn(
                'h-5 w-5',
                activa ? 'text-brand-azul' : 'text-gray-400'
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs text-gray-400 truncate">
              {reserva.numeroTicket}
            </p>
            <EstadoBadge estado={reserva.estado} compact />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-900">
            {formatDate(reserva.fechaEvento, "EEEE d 'de' MMMM")}
          </p>
          <p className="text-xs text-gray-500">
            Visita de {reserva.nombreNino} · {reserva.edadNino} años
          </p>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-1">
            Total
          </p>
          <p className="text-lg font-black text-brand-azul leading-tight">
            {formatCurrency(reserva.totalPagado)}
          </p>
        </div>

        {faltaPagar && onPagarAhora && (
          <button
            onClick={onPagarAhora}
            className="flex items-center justify-center gap-1.5 bg-[#6E2FEC] hover:bg-[#6E2FEC]/90 text-white rounded-xl px-2.5 py-2 text-xs font-bold transition-colors"
          >
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            Pagar ahora
          </button>
        )}

        {faltaPagar && !onPagarAhora && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-tight">
              Pago pendiente en caja
            </p>
          </div>
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
          className="mt-auto w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:border-brand-azul/40 hover:text-brand-azul transition-all"
        >
          Ver detalle
        </button>
      </div>
    </div>
  )
}
