// types/cliente.types.ts

export type OrigenRegistro = 'WEB' | 'PRESENCIAL' | 'ADMIN'
export type SegmentoCliente = 'NUEVO' | 'FRECUENTE' | 'VIP' | 'CORPORATIVO' | 'INACTIVO'

export interface Cliente {
  id: number
  nombre: string
  correo: string
  telefono?: string | null
  dni?: string | null
  direccion?: string | null
  ruc?: string | null
  razonSocial?: string | null
  fotoPerfil?: string | null
  tipoCliente?: 'PERSONA' | 'EMPRESA' | null
  fechaNacimiento?: string | null
  ultimoLogin?: string | null
  esVip: boolean
  descuentoVip?: number | null
  contadorVisitas: number
  correoVerificado: boolean
  activo: boolean
  origenRegistro: OrigenRegistro
  tieneAccesoWeb: boolean
  aceptaComunicaciones: boolean
  observaciones?: string | null
  fechaMigracionWeb?: string | null
  ultimaVisita?: string | null
  totalGastado?: number | null
  segmentoCliente: SegmentoCliente
  fechaCreacion: string
}

export interface RegistrarClientePayload {
  nombre: string
  correo: string
  contrasena: string
  telefono: string
  dni?: string
  ruc?: string
  razonSocial?: string
  direccionFiscal?: string
}

export interface RegistrarClienteAdminPayload {
  nombre: string
  correo?: string
  telefono: string
  dni?: string
  fechaNacimiento?: string
  observaciones?: string
  tipoCliente?: 'PERSONA' | 'EMPRESA'
  aceptaComunicaciones: boolean
}

export interface MigrarClienteWebPayload {
  correo: string
  contrasena: string
  nombre: string
  telefono: string
}

export interface ActualizarClientePayload {
  nombre?: string
  telefono?: string
  ruc?: string
  razonSocial?: string
  direccion?: string
}

export interface ListarClientesParams {
  page?: number
  size?: number
  search?: string
  esVip?: boolean
  activo?: boolean
  verificado?: boolean
  frecuente?: boolean
  tieneAccesoWeb?: boolean
  aceptaComunicaciones?: boolean
  origenRegistro?: OrigenRegistro
  segmentoCliente?: SegmentoCliente
  sort?: string
}
