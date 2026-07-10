'use client'

import { useState } from 'react'
import { Loader2, Undo2 } from 'lucide-react'
import { useCajaMutations } from '../hooks/useFinanceData'
import { MovimientoCaja } from '../types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

interface AnularMovimientoModalProps {
  movimiento: MovimientoCaja | null
  onClose: () => void
}

export function AnularMovimientoModal({
  movimiento,
  onClose,
}: AnularMovimientoModalProps) {
  const { anularMovimiento } = useCajaMutations()
  const [motivo, setMotivo] = useState('')

  function cerrar() {
    setMotivo('')
    onClose()
  }

  function confirmar() {
    if (!movimiento || motivo.trim().length === 0) return
    anularMovimiento.mutate(
      { idMovimiento: movimiento.id, payload: { motivo: motivo.trim() } },
      { onSuccess: cerrar }
    )
  }

  return (
    <Dialog open={!!movimiento} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anular movimiento</DialogTitle>
        </DialogHeader>
        {movimiento && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Concepto</span>
                <span className="font-medium text-gray-900 text-right max-w-[240px] truncate">
                  {movimiento.concepto}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto</span>
                <span className="font-semibold">
                  {movimiento.tipo === 'EGRESO' ? '-' : '+'}
                  {formatCurrency(movimiento.monto)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              El movimiento no se elimina: se registra un contraasiento que
              revierte su efecto en los totales de la caja.
            </p>
            <div className="space-y-1">
              <Label>Motivo de anulación</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Explica por qué se anula este movimiento…"
              />
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cerrar}
            disabled={anularMovimiento.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={confirmar}
            disabled={motivo.trim().length === 0 || anularMovimiento.isPending}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            {anularMovimiento.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Undo2 className="h-3.5 w-3.5" />
            )}
            Anular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
