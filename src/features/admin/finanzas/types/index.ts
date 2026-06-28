export type CategoriaEgreso =
  | 'RECURRENTE_FIJO'
  | 'RECURRENTE_VARIABLE'
  | 'EVENTUAL'

export interface TipoEgreso {
  codigo: string
  nombre: string
  descripcion?: string
  categoria: CategoriaEgreso
  esSistema: boolean
  orden: number
  activo: boolean
}

export interface RegistroEgreso {
  id: number
  tipoEgresoCodigo: string
  idSede: number
  monto: number
  fecha: string
  periodoAnio?: number
  periodoMes?: number
  descripcion?: string
  comprobanteUrl?: string
  esRecurrente: boolean
  fechaCreacion: string
}

export interface GastoEvento {
  id: number
  idEventoPrivado: number
  fechaEvento?: string
  descripcion: string
  monto: number
  comprobanteUrl?: string
  fechaCreacion: string
}

export interface GastoOperativo {
  id: number
  idSede: number
  fecha: string
  descripcion: string
  monto: number
  comprobanteUrl?: string
  fechaCreacion: string
}

export interface DesgloseTipoEgreso {
  nombreTipo: string
  categoria: CategoriaEgreso
  totalMonto: number
}

export interface ResumenFinanciero {
  anio: number
  mes: number
  totalIngresoReservas: number
  totalAdelantoEventos: number
  totalIngresoOtros: number
  totalIngresoGeneral: number
  totalEgresoGeneral: number
  totalEgresoEventos: number
  totalEgresoOperativo: number
  totalEgresoNeto: number
  utilidadNeta: number
  desglosePorTipoEgreso: DesgloseTipoEgreso[]
}

export interface ResumenEventoFinanciero {
  idEvento: number
  tipoEvento: string
  nombreCliente: string
  fechaEvento: string
  ingresoContrato: number
  montoAdelanto: number
  totalGastosAdicionales: number
  totalGastos: number
  utilidadBruta: number
}

export interface ResumenDiario {
  fecha: string
  ingresoReservas: number
  gastoOperativo: number
  utilidadDia: number
  cantidadReservas: number
  ticketPromedio: number
}

export interface ResumenRango {
  inicio: string
  fin: string
  totalIngresoReservas: number
  totalEgresoGeneral: number
  totalEgresoOperativo: number
  totalEgresoNeto: number
  utilidadNeta: number
  cantidadReservas: number
}

export interface MetricasReservas {
  anio: number
  mes: number
  totalConfirmadas: number
  totalCanceladas: number
  totalCompletadas: number
  ingresoTotal: number
  ticketPromedio: number
  ingresoEfectivo: number
  ingresoYape: number
}

export interface CrearTipoEgresoPayload {
  codigo: string
  nombre: string
  descripcion?: string
  categoria: CategoriaEgreso
}

export interface RegistrarEgresoPayload {
  tipoEgresoCodigo: string
  monto: number
  fecha: string
  periodoAnio?: number
  periodoMes?: number
  descripcion?: string
  comprobanteUrl?: string
  esRecurrente?: boolean
}

export interface RegistrarGastoEventoPayload {
  descripcion: string
  monto: number
  comprobanteUrl?: string
}

export interface RegistrarGastoOperativoPayload {
  fecha: string
  descripcion: string
  monto: number
  comprobanteUrl?: string
}

export interface ActualizarEgresoPayload {
  tipoEgresoCodigo: string
  monto: number
  fecha: string
  periodoAnio?: number
  periodoMes?: number
  descripcion?: string
  comprobanteUrl?: string
  esRecurrente?: boolean
}

export interface ActualizarGastoOperativoPayload {
  fecha: string
  descripcion: string
  monto: number
  comprobanteUrl?: string
}

export type CategoriaIngreso =
  | 'RESERVA_PUBLICA'
  | 'ADELANTO_EVENTO'
  | 'INGRESO_MANUAL'
  | 'OTRO'
export type EstadoCaja = 'ABIERTA' | 'CERRADA'
export type TipoMovimientoCaja = 'INGRESO' | 'EGRESO'
export type CategoriaRetiro =
  | 'SERVICIOS'
  | 'PROVEEDORES'
  | 'PERSONAL'
  | 'OPERATIVO'
  | 'OTRO'
export type EstadoPresupuesto = 'PENDIENTE' | 'APROBADO' | 'EJECUTADO'

export interface TipoIngreso {
  codigo: string
  nombre: string
  descripcion?: string
  esSistema: boolean
  orden: number
  activo: boolean
}

export interface RegistroIngreso {
  id: number
  tipoIngresoCodigo: string
  idSede: number
  idReservaPublica?: number
  idEventoPrivado?: number
  monto: number
  fecha: string
  medioPago?: string
  descripcion?: string
  esAutomatico: boolean
  fechaCreacion: string
}

export interface AperturaCaja {
  id: number
  idSede: number
  fecha: string
  saldoInicial: number
  saldoFinal?: number
  totalIngresos: number
  totalEgresos: number
  saldoEsperado?: number
  diferencia?: number
  estado: EstadoCaja
  idUsuarioApertura: string
  idUsuarioCierre?: string
  fechaApertura: string
  fechaCierre?: string
  observaciones?: string
}

export interface ArqueoCaja {
  id: number
  idAperturaCaja: number
  saldoEsperado: number
  saldoContado: number
  diferencia: number
  observaciones?: string
  realizadoPor: string
  fechaCreacion: string
}

export interface ResumenCaja extends AperturaCaja {
  movimientos: MovimientoCaja[]
  arqueos: ArqueoCaja[]
}

export interface RegistrarArqueoPayload {
  saldoContado: number
  observaciones?: string
}

export interface MovimientoCaja {
  id: number
  idAperturaCaja: number
  tipo: TipoMovimientoCaja
  concepto: string
  monto: number
  medioPago?: string
  categoriaRetiro?: CategoriaRetiro
  idRegistroIngreso?: number
  idRegistroEgreso?: number
  idVenta?: number
  esManual: boolean
  fechaCreacion: string
}

export interface PresupuestoEvento {
  id: number
  idEventoPrivado: number
  concepto: string
  categoria: string
  montoEstimado: number
  montoReal?: number
  estado: EstadoPresupuesto
  fechaCreacion: string
  fechaActualizacion?: string
}

export interface DashboardFinanciero {
  anio: number
  mes: number
  totalIngresos: number
  totalEgresos: number
  utilidadNeta: number
  ingresoReservas: number
  ingresoAdelantos: number
  ingresoManual: number
  egresoFijo: number
  egresoVariable: number
  egresoEventual: number
  reservasConfirmadas: number
  reservasCanceladas: number
  ticketPromedio: number
  saldoPendienteEventos: number
}

export interface CrearTipoIngresoPayload {
  codigo: string
  nombre: string
  descripcion?: string
}

export interface RegistrarIngresoManualPayload {
  tipoIngresoCodigo: string
  monto: number
  fecha: string
  medioPago?: string
  descripcion?: string
}

export interface AbrirCajaPayload {
  fecha: string
  saldoInicial: number
  observaciones?: string
}

export interface CerrarCajaPayload {
  saldoFinal: number
  observaciones?: string
}

export interface RegistrarMovimientoManualPayload {
  tipo: TipoMovimientoCaja
  concepto: string
  monto: number
  medioPago?: string
  categoriaRetiro?: CategoriaRetiro
}

export interface GuardarPresupuestoPayload {
  concepto: string
  categoria: string
  montoEstimado: number
}

export interface EjecutarPresupuestoPayload {
  montoReal: number
}
