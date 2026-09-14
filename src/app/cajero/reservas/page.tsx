'use client'

import { ReservasView } from '@/features/admin/reservas/components/views/ReservasView'
import { useAuth } from '@/hooks/useAuth'

export default function CajeroReservasPage() {
  const { tienePermiso } = useAuth()

  return (
    <ReservasView
      puedeCancelar={tienePermiso('reserva.cancelar')}
      mostrarFidelizacion={tienePermiso('calendario.configurar')}
    />
  )
}
