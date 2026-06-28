export const TIPOS_PREDEFINIDOS = [
  'TERMINOS',
  'PRIVACIDAD',
  'REEMBOLSO',
  'MENORES',
] as const
export type TipoPredefinido = (typeof TIPOS_PREDEFINIDOS)[number]
export type TipoLegal = TipoPredefinido

export interface ContenidoLegal {
  id: number
  tipo: string
  titulo: string
  contenido: string
  version: number
  activo: boolean
  fechaActualizacion?: string
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

export function esTipoPredefinido(tipo: string): tipo is TipoPredefinido {
  return (TIPOS_PREDEFINIDOS as readonly string[]).includes(tipo)
}

export function labelParaTipo(tipo: string): string {
  const labels: Record<string, string> = {
    TERMINOS: 'Términos y Condiciones',
    PRIVACIDAD: 'Política de Privacidad',
    REEMBOLSO: 'Política de Reembolso',
    MENORES: 'Protección de Menores',
  }
  return (
    labels[tipo] ??
    tipo.charAt(0).toUpperCase() +
      tipo.slice(1).toLowerCase().replace(/_/g, ' ')
  )
}

export function slugParaTipo(tipo: string): string {
  const slugs: Record<string, string> = {
    TERMINOS: 'terminos',
    PRIVACIDAD: 'privacidad',
    REEMBOLSO: 'reembolsos',
    MENORES: 'menores',
  }
  return slugs[tipo] ?? tipo.toLowerCase().replace(/_/g, '-')
}

export const TIPO_LEGAL_LABELS: Record<TipoPredefinido, string> = {
  TERMINOS: 'Términos y Condiciones',
  PRIVACIDAD: 'Política de Privacidad',
  REEMBOLSO: 'Política de Reembolso',
  MENORES: 'Protección de Menores',
}

export const SLUG_TO_TIPO: Record<string, TipoPredefinido> = {
  terminos: 'TERMINOS',
  privacidad: 'PRIVACIDAD',
  reembolsos: 'REEMBOLSO',
  menores: 'MENORES',
}

export const TIPOS_SIEMPRE_ACTIVOS: ReadonlySet<string> = new Set([
  'TERMINOS',
  'PRIVACIDAD',
])
