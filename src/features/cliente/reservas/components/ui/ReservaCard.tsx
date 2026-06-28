import { QrCode, AlertTriangle } from 'lucide-react'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'
import { EstadoBadge } from '@/features/cliente/shared/components/EstadoBadge'

interface ReservaCardProps {
  reserva: Reserva
  onVerDetalle: () => void
}

export function ReservaCard({ reserva, onVerDetalle }: ReservaCardProps) {
  const activa =
    reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA'

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border overflow-hidden flex flex-col',
        activa ? 'border-brand-azul/20' : 'border-gray-100'
      )}
    >
      <div className={cn('h-1', activa ? 'bg-brand-azul' : 'bg-gray-200')} />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
              activa ? 'bg-brand-azul/10' : 'bg-gray-100'
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
          <p className="text-lg font-black text-brand-azul">
            {formatCurrency(reserva.totalPagado)}
          </p>
        </div>

        {reserva.estado === 'PENDIENTE' && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <p className="text-[11px] text-amber-800 leading-tight">
              Pago pendiente en caja
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
