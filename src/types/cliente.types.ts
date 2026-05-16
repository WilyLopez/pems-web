// types/cliente.types.ts

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
  sort?: string
}
