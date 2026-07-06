import { CheckCircle2, Download } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { downloadFile } from '@/utils/download.utils'
import { Reserva } from '@/features/admin/reservas/types'
import { cn } from '@/lib/utils'

interface SuccessStepProps {
  reservaCreada: Reserva
  correo: string
  onNuevaReserva: () => void
  onCancelar: () => Promise<void>
  isCancelando: boolean
}

export function SuccessStep({
  reservaCreada,
  correo,
  onNuevaReserva,
  onCancelar,
  isCancelando,
}: SuccessStepProps) {
  return (
    <div className="container max-w-xl mx-auto px-4 pt-24 pb-12">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm shadow-green-50 animate-bounce">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            Reserva confirmada
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tu ticket ha sido generado exitosamente
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">
              Ticket
            </span>
            <span className="font-mono font-black text-brand-azul text-base">
              {reservaCreada.numeroTicket}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Estado</span>
            <span
              className={cn(
                'text-xs font-bold px-3 py-1 rounded-full shadow-sm',
                reservaCreada.estado === 'PENDIENTE'
                  ? 'bg-amber-100 text-amber-800'
                  : reservaCreada.estado === 'CANCELADA'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
              )}
            >
              {(
                {
                  PENDIENTE: 'Pendiente de pago',
                  CONFIRMADA: 'Confirmada',
                  CANCELADA: 'Cancelada',
                } as Record<string, string>
              )[reservaCreada.estado] ?? reservaCreada.estado}
            </span>
          </div>
          <div className="border-t border-gray-200/80 pt-3 space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Fecha</span>
              <span className="font-semibold text-gray-800">
                {format(
                  parseISO(reservaCreada.fechaEvento),
                  "d 'de' MMMM yyyy",
                  { locale: es }
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Niño</span>
              <span className="font-semibold text-gray-800">
                {reservaCreada.nombreNino}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="font-black text-green-700">
                S/ {reservaCreada.totalPagado}
              </span>
            </div>
          </div>
        </div>

        {reservaCreada.estado === 'PENDIENTE' && (
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              {reservaCreada.medioPago === 'YAPE'
                ? 'Comprobante recibido. Nuestro equipo lo validará en los próximos minutos.'
                : 'Recuerda pagar en caja al llegar al local para confirmar tu ingreso.'}
            </p>
          </div>
        )}

        {reservaCreada.estado === 'CANCELADA' && (
          <div className="bg-red-50 border border-red-200/80 rounded-2xl p-4 text-left">
            <p className="text-xs font-bold text-red-800 leading-relaxed">
              Esta reserva ha sido cancelada. Las plazas fueron liberadas en el calendario.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          Recibirás un correo con tu ticket en PDF en{' '}
          <strong className="text-gray-800 font-bold">{correo}</strong>
        </p>

        <div className="flex flex-col gap-3 pt-2">
          {reservaCreada.estado !== 'CANCELADA' && (
            <button
              onClick={async () => {
                try {
                  await downloadFile(
                    `/reservas/${reservaCreada.id}/ticket`,
                    `ticket-${reservaCreada.numeroTicket}.pdf`
                  )
                  toast.success('Ticket descargado exitosamente')
                } catch {
                  toast.error('Error al descargar el ticket en PDF')
                }
              }}
              className="w-full py-3 bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-100"
            >
              <Download className="h-5 w-5" />
              Descargar Ticket PDF
            </button>
          )}

          <div className="flex gap-3">
            <button
              onClick={onNuevaReserva}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Nueva reserva
            </button>
            <Link
              href="/cliente/mis-reservas"
              className="flex-1 py-2.5 bg-brand-rosa text-white rounded-xl font-bold text-sm text-center hover:bg-brand-rosa/90 transition-colors shadow-sm shadow-brand-rosa"
            >
              Mis reservas
            </Link>
          </div>

          {reservaCreada.estado === 'PENDIENTE' && (
            <button
              type="button"
              onClick={async () => {
                const confirmMsg =
                  reservaCreada.medioPago === 'YAPE'
                    ? '¿Seguro que deseas cancelar esta reserva? Si ya transferiste por Yape, deberás coordinar la devolución manual de tu dinero por soporte de WhatsApp.'
                    : '¿Seguro que deseas cancelar tu reserva?'
                if (window.confirm(confirmMsg)) {
                  await onCancelar()
                }
              }}
              disabled={isCancelando}
              className="text-xs font-semibold text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors w-fit mx-auto mt-2 block"
            >
              {isCancelando ? 'Cancelando reserva...' : '¿Te equivocaste? Cancelar esta reserva'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
