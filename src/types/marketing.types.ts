export interface TipoEmail {
  codigo: string
  nombre: string
  descripcion?: string | null
  esSistema: boolean
  orden: number
  activo: boolean
}

export interface PlantillaEmail {
  id: number
  tipoEmailCodigo: string
  tipoEmailNombre: string
  nombre: string
  asunto: string
  contenidoHtml: string
  contenidoFallback?: string | null
  variablesPermitidas?: string | null
  contenidoBloques?: string | null
  activa: boolean
  fechaActualizacion: string
}

export interface CorreoMarketing {
  id: number
  tipoEmailCodigo: string
  tipoEmailNombre: string
  nombre: string
  asunto: string
  contenidoBloques: string
  variablesPermitidas?: string | null
  contenidoFallback?: string | null
  activa: boolean
  fechaActualizacion: string
}

export interface CrearCorreoMarketingPayload {
  tipoEmailCodigo: string
  nombre: string
  asunto: string
  contenidoBloques: string
  variablesPermitidas?: string
  contenidoFallback?: string
}

export interface ActualizarCorreoMarketingPayload {
  nombre: string
  asunto: string
  contenidoBloques: string
  variablesPermitidas?: string
  contenidoFallback?: string
}

export type EstadoCampana =
  | 'BORRADOR'
  | 'PROGRAMADA'
  | 'ENVIANDO'
  | 'FINALIZADA'
  | 'CANCELADA'

export interface CampanaEmail {
  id: number
  nombre: string
  descripcion?: string | null
  idPlantillaEmail: number
  plantillaNombre: string
  estado: EstadoCampana
  fechaProgramada?: string | null
  totalDestinatarios: number
  totalEnviados: number
  totalFallidos: number
  createdBy?: string
  fechaCreacion: string
}

export type EstadoEnvio =
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'ERROR'
  | 'REBOTADO'
  | 'CANCELADO'

export interface EnvioEmail {
  id: number
  idCampanaEmail: number
  idCliente?: number | null
  destinatario: string
  asunto: string
  estado: EstadoEnvio
  intentos: number
  fechaEnvio?: string | null
  mensajeError?: string | null
  fechaCreacion: string
}

export interface CrearPlantillaPayload {
  tipoEmailCodigo: string
  nombre: string
  asunto: string
  contenidoHtml: string
  contenidoFallback?: string
  variablesPermitidas?: string
}

export interface CrearCampanaPayload {
  nombre: string
  descripcion?: string
  idPlantillaEmail: number
  fechaProgramada?: string
}

export interface CrearTipoEmailPayload {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface EnviarCampanaPayload {
  soloVip?: boolean
  soloFrecuentes?: boolean
  soloNuevos?: boolean
  soloInactivos?: boolean
  soloCorporativos?: boolean
  soloConAccesoWeb?: boolean
  soloPresenciales?: boolean
}
