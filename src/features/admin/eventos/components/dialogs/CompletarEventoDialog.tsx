'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useCompletarEvento } from '../../hooks/useEventos'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'

interface CompletarEventoDialogProps {
  open: boolean
  onClose: () => void
  idEvento: number
  montoSaldo: number
  checklistCompletadas: number
  checklistTotal: number
}

export function CompletarEventoDialog({
  open,
  onClose,
  idEvento,
  montoSaldo,
  checklistCompletadas,
  checklistTotal,
}: CompletarEventoDialogProps) {
  const completarEvento = useCompletarEvento()
  const checklistPendiente =
    checklistTotal > 0 && checklistCompletadas < checklistTotal

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Marcar evento como completado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            El evento pasara a estado COMPLETADA. Esta accion no puede
            revertirse.
          </p>
          {montoSaldo > 0 && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                El cliente tiene un saldo pendiente de{' '}
                <span className="font-bold">{formatCurrency(montoSaldo)}</span>.
              </p>
            </div>
          )}
          {checklistPendiente && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                El checklist operativo tiene{' '}
                <span className="font-bold">
                  {checklistTotal - checklistCompletadas} tarea(s) sin completar
                </span>{' '}
                ({checklistCompletadas}/{checklistTotal}).
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onClose}
            disabled={completarEvento.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            disabled={completarEvento.isPending}
            onClick={() =>
              completarEvento.mutate(idEvento, { onSuccess: onClose })
            }
          >
            {completarEvento.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {montoSaldo > 0 || checklistPendiente
              ? 'Completar de todas formas'
              : 'Marcar completado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
