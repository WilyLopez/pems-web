export interface TicketDetalle {
  idReserva: number
  numeroTicket: string
  estado: string
  yaIngreso: boolean
  fechaIngreso?: string
  fechaVisita: string
  esHoy: boolean
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  montoPagado: number
  estadoPago: string
  codigoQr?: string
}
