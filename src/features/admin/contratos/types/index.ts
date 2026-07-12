import { PagedResponse } from '@/types/api.types'

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
  usuarioCarga?: string
  fechaCarga?: string
  nombreCliente?: string
  correoCliente?: string
  tipoEvento?: string
  fechaEvento?: string
  turno?: string
  aforoDeclarado?: number
  precioTotalContrato?: number
  montoAdelanto?: number
  saldoPendiente?: number
  actividades?: ActividadContrato[]
}

export interface ContratoPage extends PagedResponse<Contrato> {}
