export type OrigenCliente = 'WEB' | 'MOSTRADOR' | 'ADMIN' | 'IMPORTACION'
export type SegmentoCliente = 'NUEVO' | 'FRECUENTE' | 'VIP' | 'CORPORATIVO' | 'INACTIVO'

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
  fotoPerfilPath?: string | null
  fechaNacimiento?: string | null
}

export interface RegistrarClienteAdminPayload {
  tipoDocumentoCodigo: string
  numeroDocumento: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno?: string
  correo?: string
  telefono?: string
  origen?: OrigenCliente
  aceptaComunicaciones: boolean
}

export interface ActualizarClientePayload {
  nombres?: string
  apellidoPaterno?: string
  apellidoMaterno?: string
  telefono?: string
  correo?: string
  aceptaComunicaciones?: boolean
}

export interface RegistrarClientePayload {
  nombre: string
  correo: string
  password: string
  telefono: string
  tipoDocumento: string
  numeroDocumento: string
}

export interface ListarClientesParams {
  page?: number
  size?: number
  search?: string
  esVip?: boolean
  activo?: boolean
  frecuente?: boolean
  aceptaComunicaciones?: boolean
  origen?: OrigenCliente
  segmentoCodigo?: SegmentoCliente
  sort?: string
}
