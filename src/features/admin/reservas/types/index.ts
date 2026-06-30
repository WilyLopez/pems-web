export type EstadoReserva =
  | 'PENDIENTE'
  | 'CONFIRMADA'
  | 'REPROGRAMADA'
  | 'COMPLETADA'
  | 'CANCELADA'

export interface EstadoReservaInfo {
  nombre: string
  descripcion: string
}

export interface Reserva {
  id: number
  ventaId: number | null
  idCliente: number
  idSede: number
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
  dniAcompanante: string
  firmoConsentimiento: boolean
  esReprogramacion: boolean
  vecesReprogramada: number
  ingresado: boolean
  fechaIngreso: string | null
  codigoQr: string
  medioPago: string | null
  referenciaPago?: string | null
  fechaCreacion: string
  nombreCliente?: string | null
  correoCliente?: string | null
  nombreSede?: string | null
  motivoCancelacion?: string | null
}

export interface MetricasReserva {
  fecha: string | null
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

export interface BuscarReservasParams {
  idSede?: number
  estado?: string
  fecha?: string
  ingresado?: boolean
  esReprogramacion?: boolean
  medioPago?: string
  search?: string
  page?: number
  size?: number
  sort?: string
}

export interface PageableResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}
