export type OrigenCliente = 'WEB' | 'MOSTRADOR' | 'ADMIN' | 'IMPORTACION'
export type SegmentoCliente =
  | 'NUEVO'
  | 'FRECUENTE'
  | 'VIP'
  | 'CORPORATIVO'
  | 'INACTIVO'

export type FiltroCliente =
  | 'todos'
  | 'vip'
  | 'activos'
  | 'inactivos'
  | 'verificados'
  | 'frecuentes'
  | 'web'
  | 'presenciales'
  | 'admin'
  | 'nuevos'
  | 'inactivos_seg'

export interface Cliente {
  id: number
  tipoDocumentoCodigo: string
  numeroDocumento: string
  nombres: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  nombreCompleto: string
  correo?: string
  telefono?: string
  esVip: boolean
  descuentoVip?: number
  contadorVisitas: number
  ultimaVisitaAt?: string
  totalGastado: number
  segmentoCodigo: SegmentoCliente
  origen: OrigenCliente
  aceptaComunicaciones: boolean
  creadoEn: string
}

export interface ListarClientesParams {
  page?: number
  size?: number
  search?: string
  esVip?: boolean
  activo?: boolean
  frecuente?: boolean
  origen?: OrigenCliente
  segmentoCodigo?: SegmentoCliente
}
