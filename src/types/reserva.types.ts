import { PagedResponse } from '@/types/api.types'

export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'REPROGRAMADA'
  | 'COMPLETADA'
  | 'CANCELADA'

export type MedioPago = 'YAPE' | 'CAJA'

export interface Reserva {
  id: number
  idCliente: number
  nombreCliente?: string
  correoCliente?: string
  idSede: number
  nombreSede?: string
  estado: EstadoReserva
  canalReserva: string
  tipoDia: string
  fechaEvento: string
  numeroTicket: string
  precioHistorico: number
  descuentoAplicado: number
  totalPagado: number
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante?: string
  firmoConsentimiento: boolean
  esReprogramacion: boolean
  vecesReprogramada: number
  motivoCancelacion?: string
  ingresado: boolean
  fechaIngreso?: string
  codigoQr?: string
  medioPago?: MedioPago | string
  referenciaPago?: string
  fechaCreacion: string
}

export interface MetricasReserva {
  fecha: string
  totalReservas: number
  pendientes: number
  confirmadas: number
  canceladas: number
  ingresados: number
  aforoMaximo: number
  aforoOcupado: number
  aforoRestante: number
  ingresosDia: number
}

export interface ReservaPage extends PagedResponse<Reserva> {}

export interface CrearReservaPayload {
  canalReserva: string
  fechaEvento: string
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  firmoConsentimiento: boolean
  medioPago: MedioPago
  referenciaPago?: string
  idPromocionManual?: number
}

export interface ReprogramarReservaPayload {
  nuevaFechaEvento: string
}
