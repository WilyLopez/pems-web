const TIPO_EVENTO_LABEL: Record<string, string> = {
  CUMPLEANOS:       'Cumpleaños',
  BABY_SHOWER:      'Baby shower',
  FIN_ANIO_ESCOLAR: 'Fin de año escolar',
  TEMATICO:         'Evento temático',
  SALIDA_ESCOLAR:   'Salida escolar',
  FAMILIAR:         'Celebración familiar',
}

export function formatTipoEvento(codigo: string): string {
  return TIPO_EVENTO_LABEL[codigo] ?? codigo
}

/** Visitas necesarias para alcanzar el segmento "FRECUENTE" */
export const FRECUENTE_THRESHOLD = 5

/** Restricciones de foto de perfil */
export const FOTO_MAX_BYTES = 5 * 1024 * 1024
export const FOTO_TIPOS = ['image/jpeg', 'image/png', 'image/webp']

/** Stale time por defecto para queries del módulo (5 min) */
export const DEFAULT_STALE_TIME = 5 * 60 * 1000
