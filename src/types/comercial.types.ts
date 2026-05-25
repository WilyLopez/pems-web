export interface PaqueteEvento {
  id: number
  nombre: string
  slug: string
  descripcionCorta: string
  descripcionLarga?: string
  precio: number
  badge?: string
  color?: string
  imagenUrl?: string
  duracionMinutos?: number
  limitepersonas?: number
  activo: boolean
  destacado: boolean
  orden: number
  beneficios: string[]
  fechaCreacion: string
  fechaActualizacion?: string
}

export interface ZonaJuego {
  id: number
  nombre: string
  slug: string
  descripcion: string
  edadMinima?: number
  edadMaxima?: number
  activa: boolean
  destacada: boolean
  orden: number
  imagenes: string[]
  videos: string[]
  fechaCreacion: string
  fechaActualizacion?: string
}

export interface ActividadLocal {
  id: number
  nombre: string
  descripcion: string
  imagenUrl?: string
  idZona?: number
  nombreZona?: string
  esEspecial: boolean
  fechaInicio?: string
  fechaFin?: string
  activa: boolean
  destacada: boolean
  orden: number
  fechaCreacion: string
  fechaActualizacion?: string
}

export interface NovedadLocal {
  id: number
  titulo: string
  descripcion: string
  imagenUrl?: string
  textoCta?: string
  urlCta?: string
  prioridad: number
  fechaInicio?: string
  fechaFin?: string
  visibleHome: boolean
  destacada: boolean
  activa: boolean
  fechaCreacion: string
  fechaActualizacion?: string
}

export interface CrearPaquetePayload {
  nombre: string
  descripcionCorta: string
  descripcionLarga?: string
  precio: number
  badge?: string
  color?: string
  imagenUrl?: string
  duracionMinutos?: number
  limitepersonas?: number
  beneficios?: string[]
}

export interface ActualizarPaquetePayload extends CrearPaquetePayload {
  activo: boolean
  destacado: boolean
  orden: number
}

export interface CrearZonaPayload {
  nombre: string
  descripcion: string
  edadMinima?: number
  edadMaxima?: number
  imagenes?: string[]
  videos?: string[]
}

export interface ActualizarZonaPayload extends CrearZonaPayload {
  activa: boolean
  destacada: boolean
  orden: number
}

export interface CrearActividadPayload {
  nombre: string
  descripcion: string
  imagenUrl?: string
  idZona?: number
  esEspecial: boolean
  fechaInicio?: string
  fechaFin?: string
}

export interface ActualizarActividadPayload extends CrearActividadPayload {
  activa: boolean
  destacada: boolean
  orden: number
}

export interface CrearNovedadPayload {
  titulo: string
  descripcion: string
  imagenUrl?: string
  textoCta?: string
  urlCta?: string
  prioridad: number
  fechaInicio?: string
  fechaFin?: string
  visibleHome: boolean
  destacada: boolean
}

export interface ActualizarNovedadPayload extends CrearNovedadPayload {
  activa: boolean
}
