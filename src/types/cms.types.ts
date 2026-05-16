export interface SeccionWeb {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  ordenVisualizacion: number
  visible: boolean
}

export interface TipoContenido {
  id: number
  codigo: string
  descripcion: string
}

export interface ContenidoWeb {
  id: number
  idSeccion: number
  idTipoContenido?: number
  clave: string
  valorEs: string
  valorEn?: string
  imagenUrl?: string
  descripcion?: string
  ordenVisualizacion: number
  visible: boolean
  version: number
  metadatos?: string
  activo: boolean
  fechaActualizacion: string
}

export interface ActualizarContenidoWebPayload {
  valorEs: string
  valorEn?: string
  imagenUrl?: string
  descripcion?: string
  visible?: boolean
  metadatos?: string
}

export interface CrearSeccionWebPayload {
  codigo: string
  nombre: string
  descripcion?: string
  ordenVisualizacion?: number
  visible?: boolean
}

export interface ActualizarSeccionWebPayload extends CrearSeccionWebPayload {}
