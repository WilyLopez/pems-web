export type TipoBanner =
  | 'HERO'
  | 'PROMOCION'
  | 'EVENTO'
  | 'INFORMATIVO'
  | 'TEMPORADA'

export interface Banner {
  id: number
  idSede?: number
  titulo: string
  descripcion?: string
  imagenUrl: string
  imagenMovilUrl?: string
  enlaceDestino?: string
  textoBoton?: string
  colorOverlay?: string
  tipoBanner?: TipoBanner
  prioridad: number
  soloMovil: boolean
  soloDesktop: boolean
  fechaInicio: string
  fechaFin?: string
  activo: boolean
  orden: number
  fechaCreacion?: string
}

export interface CrearBannerPayload {
  idSede?: number
  titulo: string
  descripcion?: string
  imagenUrl: string
  imagenMovilUrl?: string
  enlaceDestino?: string
  textoBoton?: string
  colorOverlay?: string
  tipoBanner?: TipoBanner
  prioridad?: number
  soloMovil?: boolean
  soloDesktop?: boolean
  fechaInicio: string
  fechaFin?: string
  orden?: number
}

export interface ActualizarBannerPayload extends CrearBannerPayload {}

export interface ReordenarBannersPayload {
  ids: number[]
}
