import React from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useCancelarReserva } from '../../hooks/useReservasData'

interface CancelarDialogProps {
  open: boolean
  onClose: () => void
  reservaId?: number
  numeroTicket?: string
}

export const CancelarDialog = React.memo(({ open, onClose, reservaId, numeroTicket }: CancelarDialogProps) => {
  const cancelar = useCancelarReserva()

  const handleConfirm = () => {
    if (!reservaId) return
    cancelar.mutate(
      { id: reservaId, motivo: 'Cancelado por el administrador' },
      { onSuccess: onClose }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Cancelar Reserva"
      description={`¿Estas seguro que deseas cancelar la reserva con ticket ${numeroTicket}? Esta accion no se puede deshacer.`}
      confirmLabel="Si, cancelar reserva"
      onConfirm={handleConfirm}
      loading={cancelar.isPending}
      destructive
    />
  )
})

CancelarDialog.displayName = 'CancelarDialog'
