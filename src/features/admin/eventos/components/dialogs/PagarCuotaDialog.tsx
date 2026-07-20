'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { useRegistrarPagoCuota } from '../../hooks/useEventos'
import { EventoCuota, PagoItem } from '../../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { CajaRequeridaAlert } from '@/features/admin/finanzas'
import { MultiMedioPago } from '../forms/MultiMedioPago'
import { formatCurrency } from '@/lib/utils'

interface PagarCuotaDialogProps {
  cuota: EventoCuota | null
  idEvento: number
  sinCajaAdministrativa: boolean
  onClose: () => void
}

export function PagarCuotaDialog({
  cuota,
  idEvento,
  sinCajaAdministrativa,
  onClose,
}: PagarCuotaDialogProps) {
  const registrarCuota = useRegistrarPagoCuota()
  const [cuotaIdInicializada, setCuotaIdInicializada] = useState<number | null>(
    null
  )
  const [pagosCuota, setPagosCuota] = useState<PagoItem[]>([
    { medioPago: '', monto: 0 },
  ])

  if (cuota && cuota.id !== cuotaIdInicializada) {
    setCuotaIdInicializada(cuota.id)
    setPagosCuota([{ medioPago: '', monto: cuota.monto }])
  }

  const efectivoCuotaBloqueado =
    sinCajaAdministrativa &&
    pagosCuota.some((p) => p.medioPago === 'EFECTIVO' && p.monto > 0)

  return (
    <Dialog open={!!cuota} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Registrar pago · Cuota {cuota?.numeroCuota}
          </DialogTitle>
        </DialogHeader>
        {cuota && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Monto de la cuota
              </span>
              <span className="font-bold">{formatCurrency(cuota.monto)}</span>
            </div>
            <MultiMedioPago
              value={pagosCuota}
              onChange={setPagosCuota}
              totalEsperado={cuota.monto}
            />
            {efectivoCuotaBloqueado && (
              <CajaRequeridaAlert mensaje="Para cobrar en efectivo necesitas tu Caja Administrativa abierta." />
            )}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={onClose}
            disabled={registrarCuota.isPending}
          >
            Cancelar
          </Button>
          <Button
            className="rounded-xl bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            disabled={
              registrarCuota.isPending ||
              efectivoCuotaBloqueado ||
              pagosCuota.some((p) => !p.medioPago || !p.monto) ||
              Math.abs(
                pagosCuota.reduce((s, p) => s + p.monto, 0) -
                  (cuota?.monto ?? 0)
              ) >= 0.01
            }
            onClick={() => {
              if (!cuota) return
              registrarCuota.mutate(
                { idEvento, idCuota: cuota.id, payload: { pagos: pagosCuota } },
                { onSuccess: onClose }
              )
            }}
          >
            {registrarCuota.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Confirmar pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
