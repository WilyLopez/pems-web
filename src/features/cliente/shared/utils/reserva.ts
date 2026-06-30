import { startOfDay } from 'date-fns'
import { Reserva } from '@/features/admin/reservas/types'

export const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const isReservaExpirada = (reserva: Reserva) => {
  const hoy = startOfDay(new Date())
  const fecha = parseLocalDate(reserva.fechaEvento)
  return (
    (reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') &&
    fecha < hoy
  )
}

export const getEstadoEfectivo = (reserva: Reserva) => {
  if (isReservaExpirada(reserva)) return 'EXPIRADA'
  return reserva.estado
}
