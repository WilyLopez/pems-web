export interface ConfiguracionPublica {
  nombreNegocio: string
  slogan?: string
  logoUrl?: string
  faviconUrl?: string
  telefono?: string
  telefonoSecundario?: string
  whatsapp?: string
  correo?: string
  correoSecundario?: string
  direccion?: string
  googleMapsUrl?: string
  horarioSemana?: string
  horarioFinDeSemana?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  youtubeUrl?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  openGraphTitle?: string
  openGraphDescription?: string
  openGraphImageUrl?: string
  googleAnalyticsId?: string
  metaPixelId?: string
  mantenimientoActivo: boolean
  mensajeMantenimiento?: string
  colorTema?: string
  colorSecundario?: string
  copyrightTexto?: string
  metricasNegocio?: string
  reglasLocal?: string
  updatedAt?: string
}

export type ActualizarConfiguracionPayload = Omit<
  ConfiguracionPublica,
  'updatedAt'
>
