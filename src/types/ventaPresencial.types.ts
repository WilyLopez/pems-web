export type MetodoPago = 'EFECTIVO' | 'YAPE' | 'TARJETA' | 'PLIN' | 'TRANSFERENCIA'

export interface NinoVenta {
  nombreNino: string
  edadNino: number
}

export interface PagoLinea {
  medioPago: MetodoPago
  monto: number
  referencia?: string
}

export interface RegistrarVentaMostradorPayload {
  tipoVenta: 'RESERVA'
  sedeId: number
  clienteId?: number
  fechaVisita: string
  ninos: NinoVenta[]
  nombreAcompanante?: string
  dniAcompanante?: string
  telefonoAcompanante?: string
  idPromocion?: number
  pagos: PagoLinea[]
  efectivoRecibido?: number
  actaFirmada: boolean
  notas?: string
}

export interface TicketResumen {
  reservaId: number
  numeroTicket: string
  nombreNino: string
  edadNino: number
  codigoQr?: string
}

export interface PagoResumen {
  pagoId: number
  medioPago: string
  monto: number
}

export interface VentaMostradorResponse {
  ventaId: number
  sedeId: number
  fechaVisita: string
  subtotal: number
  descuento: number
  total: number
  efectivoRecibido: number
  vuelto: number
  createdAt: string
  tickets: TicketResumen[]
  pagos: PagoResumen[]
}

export interface PrecioDia {
  precio: number
  tipoDia: string
  esFindeSemanaOFeriado: boolean
}

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
