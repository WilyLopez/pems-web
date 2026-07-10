'use client'

import { useState } from 'react'
import { Loader2, Undo2 } from 'lucide-react'
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

interface RegistroAnulable {
  id: number
  concepto: string
  monto: number
}

interface AnularRegistroModalProps {
  titulo: string
  registro: RegistroAnulable | null
  pending: boolean
  onConfirmar: (motivo: string) => void
  onClose: () => void
  descripcion?: string
  etiquetaMotivo?: string
  textoBoton?: string
}

export function AnularRegistroModal({
  titulo,
  registro,
  pending,
  onConfirmar,
  onClose,
  descripcion = 'El registro no se elimina: se crea un contraasiento que revierte su efecto en los reportes financieros.',
  etiquetaMotivo = 'Motivo de anulación',
  textoBoton = 'Anular',
}: AnularRegistroModalProps) {
  const [motivo, setMotivo] = useState('')

  function cerrar() {
    setMotivo('')
    onClose()
  }

  function confirmar() {
    if (!registro || motivo.trim().length === 0) return
    onConfirmar(motivo.trim())
  }

  return (
    <Dialog open={!!registro} onOpenChange={(o) => !o && cerrar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        {registro && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Concepto</span>
                <span className="font-medium text-gray-900 text-right max-w-[240px] truncate">
                  {registro.concepto}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto</span>
                <span className="font-semibold">
                  {formatCurrency(registro.monto)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">{descripcion}</p>
            <div className="space-y-1">
              <Label>{etiquetaMotivo}</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Explica por qué se anula este registro…"
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
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={confirmar}
            disabled={motivo.trim().length === 0 || pending}
            className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Undo2 className="h-3.5 w-3.5" />
            )}
            {textoBoton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
