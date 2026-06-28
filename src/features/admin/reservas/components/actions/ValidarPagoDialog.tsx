import React from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useConfirmarPago } from '../../hooks/useReservasData'

interface ValidarPagoDialogProps {
  open: boolean
  onClose: () => void
  reservaId?: number
  numeroTicket?: string
}

export const ValidarPagoDialog = React.memo(
  ({ open, onClose, reservaId, numeroTicket }: ValidarPagoDialogProps) => {
    const confirmarPago = useConfirmarPago()

    const handleConfirm = () => {
      if (!reservaId) return
      confirmarPago.mutate(reservaId, { onSuccess: onClose })
    }

    return (
      <ConfirmDialog
        open={open}
        onOpenChange={(v) => !v && onClose()}
        title="Validar Pago Yape"
        description={`¿Confirmas haber recibido el pago por Yape para el ticket ${numeroTicket}? La reserva pasara a estado CONFIRMADA.`}
        confirmLabel="Si, validar pago"
        onConfirm={handleConfirm}
        loading={confirmarPago.isPending}
      />
    )
  }
)

ValidarPagoDialog.displayName = 'ValidarPagoDialog'
