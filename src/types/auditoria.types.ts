export type NivelAuditoria = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICO'
export type ResultadoAuditoria = 'EXITOSO' | 'FALLIDO' | 'DENEGADO'

export interface LogAuditoria {
  id: number
  idUsuarioAdmin?: number
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
  idUsuario?: number
  modulo?: string
  accion?: string
  entidad?: string
}
