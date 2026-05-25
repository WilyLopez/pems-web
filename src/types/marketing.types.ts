export interface TipoEmail {
  id: number
  codigo: string
  nombre: string
  descripcion?: string | null
  activo: boolean
}

export interface PlantillaEmail {
  id: number
  idTipoEmail: number
  tipoEmailCodigo: string
  tipoEmailNombre: string
  nombre: string
  asunto: string
  contenidoHtml: string
  contenidoFallback?: string | null
  variablesPermitidas?: string | null
  activa: boolean
  idUsuarioEditor?: number | null
  fechaActualizacion: string
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
  idUsuarioCreador?: number | null
  fechaCreacion: string
}

export type EstadoEnvio = 'PENDIENTE' | 'ENVIADO' | 'ERROR' | 'REBOTADO'

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
  idTipoEmail: number
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
