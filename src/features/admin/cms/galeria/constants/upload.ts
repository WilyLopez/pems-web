export const MAX_TAMANIO_MB = 5
export const MAX_TAMANIO_BYTES = MAX_TAMANIO_MB * 1024 * 1024
export const MAX_ARCHIVOS_LOTE = 20

export const TIPOS_PERMITIDOS = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export const ACCEPT_ATTR = TIPOS_PERMITIDOS.join(',')
export const EXTENSIONES_LABEL = 'PNG, JPG, WebP'
