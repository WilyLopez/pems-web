import { TipoMovimiento } from './enums'

export interface Producto {
  id: number
  idSede: number
  categoria: string
  nombre: string
  descripcion?: string
  precio: number
  stockActual: number
  stockMinimo: number
  unidadMedida: string
  activo: boolean
  enAlertaDeStock: boolean
  fechaActualizacion: string
}

export interface AlertaStock {
  idProducto: number
  idSede: number
  nombre: string
  categoria: string
  stockActual: number
  stockMinimo: number
  unidadesParaReponer: number
  fechaActualizacion: string
}

export interface MovimientoInventarioPayload {
  tipoMovimiento: TipoMovimiento
  cantidad: number
  motivo: string
}