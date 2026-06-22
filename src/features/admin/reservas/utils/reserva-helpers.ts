import { Reserva } from '../types'

export const reservaHelpers = {
  canCancel: (reserva: Reserva) => {
    return ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)
  },

  canEnter: (reserva: Reserva) => {
    return !reserva.ingresado && ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)
  },

  needsYapeValidation: (reserva: Reserva) => {
    return reserva.estado === 'PENDIENTE' && reserva.medioPago === 'YAPE'
  },

  needsCobro: (reserva: Reserva) => {
    return reserva.ventaId === null && reserva.estado !== 'CANCELADA'
  },
}
