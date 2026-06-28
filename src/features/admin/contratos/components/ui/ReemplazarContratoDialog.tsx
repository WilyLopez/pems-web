'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useReemplazarContrato } from '../../hooks/useContratos'

interface ReemplazarContratoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contratoId: number
  onSuccess?: () => void
}

export function ReemplazarContratoDialog({
  open,
  onOpenChange,
  contratoId,
  onSuccess,
}: ReemplazarContratoDialogProps) {
  const [motivo, setMotivo] = useState('')
  const reemplazar = useReemplazarContrato()

  const motivoValido = motivo.trim().length >= 10
  const caracteresRestantes = Math.max(0, 10 - motivo.trim().length)

  function handleClose() {
    setMotivo('')
    onOpenChange(false)
  }

  function handleConfirmar() {
    if (!motivoValido) return
    reemplazar.mutate(contratoId, {
      onSuccess: () => {
        handleClose()
        onSuccess?.()
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-4 w-4 text-amber-500" />
            Reemplazar contrato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <p className="text-sm text-muted-foreground">
            El contrato actual quedará archivado en el historial. Se creará un
            nuevo borrador vacío para este evento.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="motivo-reemplazar">Motivo del reemplazo</Label>
            <Textarea
              id="motivo-reemplazar"
              placeholder="Describe el motivo del reemplazo..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="resize-none"
            />
            {!motivoValido && motivo.length > 0 && (
              <p className="text-xs text-destructive">
                Faltan {caracteresRestantes} caracteres mínimos.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={!motivoValido || reemplazar.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-white border-none"
          >
            {reemplazar.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reemplazando...
              </>
            ) : (
              'Confirmar reemplazo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
