'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCancelarEvento } from '../../hooks/useEventos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'

interface CancelarEventoDialogProps {
  open: boolean
  onClose: () => void
  idEvento: number
}

export function CancelarEventoDialog({
  open,
  onClose,
  idEvento,
}: CancelarEventoDialogProps) {
  const cancelarEvento = useCancelarEvento()
  const [motivoCancelacion, setMotivoCancelacion] = useState('')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Cancelar evento
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Esta acción no puede revertirse. Ingresa el motivo de cancelación.
          </p>
          <Textarea
            value={motivoCancelacion}
            onChange={(e) => setMotivoCancelacion(e.target.value)}
            placeholder="Motivo de cancelación..."
            rows={3}
            className="resize-none"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onClose}
            disabled={cancelarEvento.isPending}
          >
            Volver
          </Button>
          <Button
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white gap-1.5"
            disabled={!motivoCancelacion.trim() || cancelarEvento.isPending}
            onClick={() => {
              if (!motivoCancelacion.trim()) return
              cancelarEvento.mutate(
                { id: idEvento, motivo: motivoCancelacion },
                { onSuccess: onClose }
              )
            }}
          >
            {cancelarEvento.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Cancelar evento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
