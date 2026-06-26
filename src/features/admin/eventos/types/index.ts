import { PagedResponse } from '@/types/api.types'

export type EstadoEvento =
  | 'SOLICITADA'
  | 'CONFIRMADA'
  | 'COMPLETADA'
  | 'CANCELADA'

export interface ChecklistItem {
  id: number
  idEventoPrivado: number
  tarea: string
  completada: boolean
  orden: number
  usuarioCompleto?: string
  fechaCompletado?: string
}

export interface EventoExtra {
  id: number
  idExtra?: number
  nombreExtra?: string
  nombreLibre?: string
}

export type EstadoCuota = 'PENDIENTE' | 'PAGADO' | 'VENCIDO'
export type ModalidadPago = 'AL_CONTADO' | 'CUOTAS'

export interface EventoCuota {
  id: number
  numeroCuota: number
  monto: number
  fechaVencimiento: string
  estado: EstadoCuota
  ventaId?: number
  createdAt: string
}

export interface PagoItem {
  medioPago: string
  monto: number
}

export interface Turno {
  id: number
  codigo: string
  nombre: string
  horaInicio: string
  horaFin: string
}

export interface ExtraPaquete {
  id: number
  nombre: string
  descripcion?: string
  orden: number
}

export interface EventoPrivado {
  id: number
  idCliente: number
  nombreCliente: string
  correoCliente?: string
  telefonoCliente?: string
  idSede: number
  estado: EstadoEvento
  idTurno: number
  turno: string
  horaInicio: string
  horaFin: string
  fechaEvento: string
  tipoEvento: string
  contactoAdicional?: string
  origenContacto?: string
  motivoCancelacion?: string
  aforoDeclarado?: number
  precioTotalContrato?: number
  montoAdelanto?: number
  montoSaldo?: number
  medioPago?: string
  observaciones?: string
  descripcionPersonalizada?: string
  presupuestoEstimado?: number
  esCotizacionPersonalizada?: boolean
  nombreNino?: string
  edadCumple?: number
  idPaquete?: number
  usuarioGestor?: string
  estadoOperativo?: string
  checklistCompleto: boolean
  horaInicioReal?: string
  horaFinReal?: string
  checklist?: ChecklistItem[]
  extras?: EventoExtra[]
  fechaCreacion?: string
  modalidadPago?: ModalidadPago
  fechaLimitePago?: string
  cuotas?: EventoCuota[]
}

export interface EventoPage extends PagedResponse<EventoPrivado> {}

export interface ServicioCotizacion {
  id: number
  nombre: string
  descripcion?: string
  precioReferencial: number
  icono?: string
}

export interface SolicitarEventoPayload {
  idTurno: number
  fechaEvento: string
  tipoEvento: string
  contactoAdicional?: string
  aforoDeclarado?: number
  nombreNino?: string
  edadCumple?: number
  idPaquete?: number
  idsExtras?: number[]
  extrasLibres?: string[]
  observaciones?: string
  descripcionPersonalizada?: string
  presupuestoEstimado?: number
  origenContacto?: string
  idsServiciosCotizacion?: number[]
  esCotizacionPersonalizada?: boolean
}

export interface ConfirmarEventoPayload {
  precioTotal: number
  montoAdelanto: number
  medioPagoAdelanto?: string
  pagosAdelanto?: PagoItem[]
  modalidadPago?: ModalidadPago
  numeroCuotas?: number
  fechaLimitePago?: string
}

export interface RegistrarPagoCuotaPayload {
  pagos: PagoItem[]
}

export interface RegistrarSaldoPayload {
  monto: number
  medioPago: string
}

export interface CancelarEventoPayload {
  motivo: string
}

export interface IndicadorEvento {
  tipo: 'CONTRATO' | 'PAGO' | 'CHECKLIST' | 'PROVEEDOR'
  mensaje: string
  nivel: 'OK' | 'WARNING' | 'DANGER'
}

export function calcularIndicadores(evento: EventoPrivado): IndicadorEvento[] {
  const indicadores: IndicadorEvento[] = []

  if (!evento.precioTotalContrato) {
    indicadores.push({
      tipo: 'CONTRATO',
      mensaje: 'Sin precio definido',
      nivel: 'DANGER',
    })
  }
  if (evento.montoSaldo && evento.montoSaldo > 0) {
    indicadores.push({
      tipo: 'PAGO',
      mensaje: `Saldo S/ ${evento.montoSaldo.toFixed(2)}`,
      nivel: 'WARNING',
    })
  }
  if (!evento.checklistCompleto) {
    indicadores.push({
      tipo: 'CHECKLIST',
      mensaje: 'Checklist incompleto',
      nivel: 'WARNING',
    })
  }

  return indicadores
}
