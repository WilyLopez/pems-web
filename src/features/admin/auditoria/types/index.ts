import { PagedResponse } from '@/types/api.types'

export type NivelAuditoria = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
export type ResultadoAuditoria = 'EXITOSO' | 'FALLIDO' | 'PARCIAL'

export interface LogAuditoria {
  id: number
  idUsuarioAdmin?: string
  nombreUsuario?: string
  accion: string
  modulo: string
  entidadAfectada: string
  idEntidad?: number
  descripcion?: string
  ipOrigen?: string
  userAgent?: string
  valorAnterior?: string
  valorNuevo?: string
  nivel: NivelAuditoria
  resultado: ResultadoAuditoria
  fechaLog: string
}

export interface AuditoriaFiltros {
  desde: string
  hasta: string
  idUsuario?: string
  modulo?: string
  accion?: string
  nivel?: string
  resultado?: string
  entidad?: string
  tamano?: number
}

export type AuditoriaPage = PagedResponse<LogAuditoria>

export const MODULOS = [
  'ACCESOS',
  'USUARIOS',
  'CONTRATOS',
  'VENTAS',
  'FACTURACION',
  'CAJA',
  'FINANZAS',
  'EVENTOS',
  'RESERVAS',
  'PROMOCIONES',
  'CONFIGURACION',
  'COMERCIAL',
  'CMS',
  'CALENDARIO',
  'MENSAJES',
] as const

export const ACCIONES = [
  'CREAR',
  'ACTUALIZAR',
  'ELIMINAR',
  'LOGIN',
  'LOGOUT',
  'LOGIN_FALLIDO',
  'BLOQUEO_CUENTA',
  'CONFIRMAR',
  'CANCELAR',
  'REPROGRAMAR',
  'FIRMAR',
  'ABRIR',
  'CERRAR',
  'ARQUEO',
  'EMITIR',
  'ANULAR',
  'ACTIVAR',
  'DESACTIVAR',
  'RESPONDER',
  'MARCAR_SPAM',
] as const

export const NIVELES: NivelAuditoria[] = ['INFO', 'WARNING', 'ERROR', 'CRITICAL']
export const RESULTADOS: ResultadoAuditoria[] = ['EXITOSO', 'FALLIDO', 'PARCIAL']

export function resolverRutaEntidad(
  modulo: string,
  idEntidad?: number
): string | null {
  if (!idEntidad) return null
  const rutas: Record<string, string> = {
    EVENTOS: `/admin/eventos/${idEntidad}`,
    RESERVAS: `/admin/eventos/reservas/${idEntidad}`,
    CONTRATOS: `/admin/eventos/${idEntidad}`,
    VENTAS: `/admin/ventas/${idEntidad}`,
    CAJA: `/admin/finanzas/caja`,
    FINANZAS: `/admin/finanzas`,
    CONFIGURACION: `/admin/configuracion`,
    CMS: `/admin/cms`,
    COMERCIAL: `/admin/comercial`,
    PROMOCIONES: `/admin/promociones`,
    CALENDARIO: `/admin/configuracion/calendario`,
    MENSAJES: `/admin/cms/mensajes`,
  }
  return rutas[modulo] ?? null
}
