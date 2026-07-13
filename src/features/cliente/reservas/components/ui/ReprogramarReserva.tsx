import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { DialogTitle } from '@/components/ui/Dialog'
import { formatDate } from '@/lib/utils'
import { Reserva } from '@/features/cliente/shared/types'
import { SelectorFechaCompacto } from './SelectorFechaCompacto'

export interface ReprogramarReservaProps {
  reserva: Reserva
  onVolver: () => void
  onExito: () => void
  onReprogramar: (params: { id: number; nuevaFecha: string }) => Promise<any>
  isReprogramando: boolean
}

export function ReprogramarReserva({
  reserva,
  onVolver,
  onExito,
  onReprogramar,
  isReprogramando,
}: ReprogramarReservaProps) {
  const [nuevaFecha, setNuevaFecha] = useState<string | null>(null)

  async function confirmar() {
    if (!nuevaFecha) return
    try {
      await onReprogramar({ id: reserva.id, nuevaFecha })
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
          Reprogramar reserva
        </DialogTitle>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <p className="text-xs text-amber-800">
            Solo puedes reprogramar una vez. Selecciona la nueva fecha.
          </p>
        </div>

        <SelectorFechaCompacto
          idSede={reserva.idSede}
          fechaSeleccionada={nuevaFecha}
          onSelect={setNuevaFecha}
        />

        {nuevaFecha && (
          <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-xl p-3">
            <p className="text-sm font-bold text-gray-900">
              {formatDate(nuevaFecha, "EEEE d 'de' MMMM")}
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
        <button
          onClick={onVolver}
          className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/40"
          type="button"
        >
          Volver
        </button>
        <button
          onClick={confirmar}
          disabled={!nuevaFecha || isReprogramando}
          className="py-2.5 rounded-xl bg-brand-azul text-white text-sm font-bold disabled:opacity-50 hover:bg-brand-azul/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-azul/50 focus-visible:ring-offset-1"
          type="button"
        >
          {isReprogramando ? 'Reprogramando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  )
}
