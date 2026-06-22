import React from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useConfirmarIngreso } from '../../hooks/useReservasData'

interface IngresoDialogProps {
  open: boolean
  onClose: () => void
  reservaId?: number
  numeroTicket?: string
}

export const IngresoDialog = React.memo(({ open, onClose, reservaId, numeroTicket }: IngresoDialogProps) => {
  const ingreso = useConfirmarIngreso()

  const handleConfirm = () => {
    if (!reservaId) return
    ingreso.mutate(reservaId, { onSuccess: onClose })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Registrar Ingreso"
      description={`¿Confirmar el ingreso al local para el ticket ${numeroTicket}?`}
      confirmLabel="Confirmar ingreso"
      onConfirm={handleConfirm}
      loading={ingreso.isPending}
    />
  )
})

IngresoDialog.displayName = 'IngresoDialog'
