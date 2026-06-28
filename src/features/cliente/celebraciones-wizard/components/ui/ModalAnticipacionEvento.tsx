'use client'

import { CalendarClock } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'

interface Props {
  open: boolean
  onClose: () => void
  diasMinimos?: number
}

export function ModalAnticipacionEvento({
  open,
  onClose,
  diasMinimos = 15,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm w-[calc(100vw-2rem)] sm:w-full rounded-2xl text-center p-6"
        aria-describedby={undefined}
      >
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
          <CalendarClock className="h-7 w-7 text-amber-600" />
        </div>
        <DialogTitle className="text-lg font-black text-gray-900">
          Fecha muy próxima
        </DialogTitle>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Los eventos privados deben reservarse con un mínimo de {diasMinimos}{' '}
          días de anticipación. Por favor selecciona una fecha posterior.
        </p>
        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-brand-rosa text-white rounded-xl font-bold text-sm hover:bg-brand-rosa/90 transition-colors"
          type="button"
        >
          Entendido
        </button>
      </DialogContent>
    </Dialog>
  )
}
