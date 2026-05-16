export interface ConfiguracionPublica {
  id: number
  nombreNegocio: string
  slogan?: string
  logoUrl?: string
  logoBlancaUrl?: string
  faviconUrl?: string
  telefonoPrincipal?: string
  telefonoSecundario?: string
  whatsapp?: string
  correoContacto?: string
  correoSoporte?: string
  direccion?: string
  ciudad?: string
  pais?: string
  latitud?: number
  longitud?: number
  horarioLunesViernes?: string
  horarioSabado?: string
  horarioDomingo?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  youtubeUrl?: string
  metaTitulo?: string
  metaDescripcion?: string
  metaKeywords?: string
  modoMantenimiento: boolean
  mensajeMantenimiento?: string
  colorPrimario?: string
  colorSecundario?: string
  colorAcento?: string
}

export type ActualizarConfiguracionPayload = Omit<ConfiguracionPublica, 'id'>
