import { useState } from 'react'
import { AlertTriangle, ChevronLeft } from 'lucide-react'
import { DialogTitle } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'

export interface CancelarReservaProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onCancelar: (params: { id: number; motivo: string }) => Promise<any>
  isCancelando: boolean
}

export function CancelarReserva({
  reserva,
  onVolver,
  onExito,
  onCancelar,
  isCancelando,
}: CancelarReservaProps) {
  const [motivo, setMotivo] = useState('')

  async function confirmar() {
    try {
      await onCancelar({ id: reserva.id, motivo: motivo.trim() })
      onExito()
    } catch {
      // toast is managed inside the hook
    }
  }

  return (
    <div className="flex flex-col min-w-0">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={onVolver}
          aria-label="Volver"
          className="text-gray-400 hover:text-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <DialogTitle className="text-lg font-black text-gray-900">
          Cancelar reserva
        </DialogTitle>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">
              ¿Seguro que deseas cancelar?
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Esta acción no se puede deshacer. El cupo quedará disponible para
              otros clientes.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-1">
          <p className="text-sm font-bold text-gray-900">
            {formatDate(reserva.fechaEvento, "EEEE d 'de' MMMM")}
          </p>
          <p className="text-xs text-gray-500">
            Visita de {reserva.nombreNino} ·{' '}
            {formatCurrency(reserva.totalPagado)}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">
            Motivo (opcional)
          </label>
          <Textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Cuéntanos por qué cancelas"
            rows={2}
            className="rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={onVolver}
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          No cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={isCancelando}
          className="py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold disabled:opacity-50 hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1"
          type="button"
        >
          {isCancelando ? 'Cancelando...' : 'Sí, cancelar'}
        </button>
      </div>
    </div>
  )
}
