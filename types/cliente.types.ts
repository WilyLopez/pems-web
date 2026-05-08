export interface Cliente {
  id: number
  nombre: string
  correo: string
  telefono: string
  dni?: string
  ruc?: string
  razonSocial?: string
  esVip: boolean
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
  nombre: string
  telefono: string
  ruc?: string
  razonSocial?: string
  direccionFiscal?: string
}