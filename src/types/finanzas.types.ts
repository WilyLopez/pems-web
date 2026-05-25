export type CategoriaEgreso = 'RECURRENTE_FIJO' | 'RECURRENTE_VARIABLE' | 'EVENTUAL'

export interface TipoEgreso {
  id: number
  nombre: string
  descripcion?: string
  categoria: CategoriaEgreso
  activo: boolean
}

export interface RegistroEgreso {
  id: number
  idTipoEgreso: number
  nombreTipoEgreso: string
  categoriaEgreso: CategoriaEgreso
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
  totalIngresoEventos: number
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
  totalGastosProveedores: number
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
}

export interface CrearTipoEgresoPayload {
  nombre: string
  descripcion?: string
  categoria: CategoriaEgreso
}

export interface RegistrarEgresoPayload {
  idTipoEgreso: number
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
