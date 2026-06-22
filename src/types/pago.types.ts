import { MedioPago, TipoPago } from './enums'

export interface Pago {
  id: number
  medioPago: string
  tipoPago: string
  monto: number
  referenciaPago?: string
  esParcial: boolean
  fechaPago: string
}

export interface RegistrarPagoPayload {
  medioPago: MedioPago
  tipoPago: TipoPago
  idReservaPublica?: number
  idEventoPrivado?: number
  idVenta?: number
  monto: number
  referenciaPago?: string
}
