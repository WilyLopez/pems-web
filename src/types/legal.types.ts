export interface ContenidoLegal {
  id: number
  tipo: string
  titulo: string
  contenido: string
  version: number
  activo: boolean
  fechaActualizacion?: string
}

export interface ContenidoLegalResumen {
  tipo: string
  etiqueta: string
  slug: string
  titulo: string
  version: number
  visibleFooter: boolean
  fechaActualizacion?: string
}

export interface TipoLegalCatalogo {
  codigo: string
  etiqueta: string
  slug: string
  orden: number
  esSistema: boolean
  requerido: boolean
  visibleFooter: boolean
  yaCreado: boolean
}

export interface ContenidoLegalHistorialItem {
  id: number
  tipo: string
  titulo: string
  contenido: string
  version: number
  createdBy?: string
  fechaCreacion?: string
}

export interface CrearContenidoLegalPayload {
  tipo: string
  titulo: string
  contenido: string
}

export interface ActualizarContenidoLegalPayload {
  titulo: string
  contenido: string
}

export type ActualizarLegalPayload = ActualizarContenidoLegalPayload
