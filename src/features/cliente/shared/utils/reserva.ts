import { isPast, parseISO } from 'date-fns'
import { Reserva } from '@/features/admin/reservas/types'

export const isReservaExpirada = (reserva: Reserva) => {
  return (
    (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') &&
    isPast(parseISO(reserva.fechaEvento))
  )
}

export const getEstadoEfectivo = (reserva: Reserva) => {
  if (isReservaExpirada(reserva)) return 'EXPIRADA'
  return reserva.estado
}
