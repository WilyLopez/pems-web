export type TipoLegal = 'TERMINOS' | 'PRIVACIDAD' | 'REEMBOLSO' | 'MENORES'

export const TIPO_LEGAL_LABELS: Record<TipoLegal, string> = {
  TERMINOS: 'Términos y Condiciones',
  PRIVACIDAD: 'Política de Privacidad',
  REEMBOLSO: 'Política de Reembolso',
  MENORES: 'Protección de Menores',
}

export const TIPO_LEGAL_SLUGS: Record<TipoLegal, string> = {
  TERMINOS: 'terminos',
  PRIVACIDAD: 'privacidad',
  REEMBOLSO: 'reembolsos',
  MENORES: 'menores',
}

export const SLUG_TO_TIPO: Record<string, TipoLegal> = {
  terminos: 'TERMINOS',
  privacidad: 'PRIVACIDAD',
  reembolsos: 'REEMBOLSO',
  menores: 'MENORES',
}

export interface ContenidoLegal {
  id: number
  tipo: TipoLegal
  titulo: string
  contenido: string
  version: number
  activo: boolean
  idUsuarioEditor?: number
  fechaActualizacion?: string
}

export interface ActualizarLegalPayload {
  titulo: string
  contenido: string
}
