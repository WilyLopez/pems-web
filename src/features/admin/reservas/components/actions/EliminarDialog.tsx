import React from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useEliminarReserva } from '../../hooks/useReservasData'

interface EliminarDialogProps {
  open: boolean
  onClose: () => void
  reservaId?: number
}

export const EliminarDialog = React.memo(({ open, onClose, reservaId }: EliminarDialogProps) => {
  const eliminar = useEliminarReserva()

  const handleConfirm = () => {
    if (!reservaId) return
    eliminar.mutate(reservaId, { onSuccess: onClose })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Eliminar Reserva"
      description="¿Estás seguro de que deseas eliminar esta reserva? Esta acción es irreversible y eliminará todos los datos relacionados (entradas, pagos, etc.)."
      confirmLabel="Sí, eliminar"
      onConfirm={handleConfirm}
      loading={eliminar.isPending}
      destructive
    />
  )
})

EliminarDialog.displayName = 'EliminarDialog'
