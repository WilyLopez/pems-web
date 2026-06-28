import { Reserva } from '../../reservas/types'

export type MetodoPago =
  | 'EFECTIVO'
  | 'YAPE'
  | 'TARJETA'
  | 'PLIN'
  | 'TRANSFERENCIA'

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
  tipoDocumentoAcompanante?: string
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

export interface VentaFiltros {
  idSede?: number
  desde?: string
  hasta?: string
  tipo?: string
  search?: string
  page?: number
  size?: number
}

export interface VentaResumen {
  id: number
  idSede: number
  clienteId?: number
  eventoId?: number
  tipo: string
  canalCodigo: string
  fechaVisita?: string
  subtotal: number
  descuento: number
  total: number
  nombreCliente?: string
  nombreAcompanante?: string
  dniAcompanante?: string
  notas?: string
  impreso: boolean
  enviadoCorreo: boolean
  descargado: boolean
  createdAt: string
  totalPagado?: number
  efectivoRecibido?: number
  vuelto?: number
}

export interface PagoDetalleResponse {
  id: number
  medioPago: string
  monto: number
  referencia?: string
  esValidado: boolean
}

export interface VentaDetalleResponse {
  id: number
  idSede: number
  clienteId?: number
  eventoId?: number
  tipo: string
  canalCodigo: string
  fechaVisita?: string
  subtotal: number
  descuento: number
  total: number
  nombreAcompanante?: string
  dniAcompanante?: string
  telefonoAcompanante?: string
  nombreCliente?: string
  notas?: string
  impreso: boolean
  enviadoCorreo: boolean
  descargado: boolean
  efectivoRecibido: number
  vuelto: number
  createdAt: string
  tickets: Reserva[]
  pagos: PagoDetalleResponse[]
  totalPagado: number
}
