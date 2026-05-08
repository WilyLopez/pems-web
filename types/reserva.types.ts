import { CanalReserva, EstadoReserva, TipoDia } from './enums'

export interface Reserva {
  id: number
  numeroTicket: string
  estado: EstadoReserva
  tipoDia: TipoDia
  fechaEvento: string
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  precioHistorico: number
  descuentoAplicado: number
  totalPagado: number
  esReprogramacion: boolean
  vecesReprogramada: number
  firmoConsentimiento: boolean
  fechaCreacion: string
}

export interface CrearReservaPayload {
  canalReserva: CanalReserva
  fechaEvento: string
  nombreNino: string
  edadNino: number
  nombreAcompanante: string
  dniAcompanante: string
  firmoConsentimiento: boolean
  idPromocionManual?: number
}

export interface ReprogramarReservaPayload {
  nuevaFechaEvento: string
}