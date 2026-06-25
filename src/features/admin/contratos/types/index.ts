import { PagedResponse } from '@/types/api.types'

export type EstadoContrato =
  | 'BORRADOR'
  | 'ENVIADO'
  | 'PENDIENTE_FIRMA'
  | 'FIRMADO'
  | 'VENCIDO'
  | 'CANCELADO'
  | 'ARCHIVADO'

export interface DocumentoContrato {
  id: number
  nombre: string
  archivoUrl: string
  tipoArchivo: string
  tamanobytes?: number
  usuarioCarga: string
  fechaCarga: string
}

export interface ActividadContrato {
  id: number
  accion: string
  descripcion: string
  usuario: string
  fechaAccion: string
}

export interface Contrato {
  id: number
  idEventoPrivado: number
  estado: EstadoContrato
  esEditable: boolean
  contenidoTexto?: string
  archivoPdfUrl?: string
  fechaFirma?: string
  usuarioRedactor?: string
  plantilla?: string
  observaciones?: string
  version: number
  fechaCreacion: string
  fechaActualizacion: string
  nombreCliente?: string
  correoCliente?: string
  tipoEvento?: string
  fechaEvento?: string
  turno?: string
  aforoDeclarado?: number
  precioTotalContrato?: number
  montoAdelanto?: number
  saldoPendiente?: number
  documentos?: DocumentoContrato[]
  actividades?: ActividadContrato[]
}

export interface ContratoPage extends PagedResponse<Contrato> {}

export interface GenerarContratoPayload {
  contenidoTexto?: string
  plantilla?: string
}

export interface ActualizarContratoPayload {
  contenidoTexto: string
  plantilla?: string
  observaciones?: string
}

export interface CambiarEstadoPayload {
  nuevoEstado: string
  motivo?: string
}
