export interface ConfiguracionPublica {
  nombreNegocio: string
  slogan?: string
  logoUrl?: string
  faviconUrl?: string
  logoSecundarioUrl?: string
  mascota1Url?: string
  mascota2Url?: string
  telefono?: string
  telefonoSecundario?: string
  whatsapp?: string
  correo?: string
  correoSecundario?: string
  facebookUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  youtubeUrl?: string
  mantenimientoActivo: boolean
  mensajeMantenimiento?: string
  copyrightTexto?: string
  metricasNegocio?: string
  updatedAt?: string
}

export type ActualizarConfiguracionPayload = Omit<
  ConfiguracionPublica,
  'updatedAt'
>
