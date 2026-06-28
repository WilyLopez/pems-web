import { NinoVenta, PagoLinea, MetodoPago } from '../types'

export interface ResumenPagosCalculado {
  sumaPagos: number
  efectivoAplicado: number
  vuelto: number
  saldo: number
  montosCoinciden: boolean
}

export interface ResumenVentaCalculado extends ResumenPagosCalculado {
  subtotal: number
  descuento: number
  total: number
}

interface Promocion {
  id: number
  tipoPromocion: string
  valorDescuento?: number
  activo: boolean
}

export const VUELTO_SOSPECHOSO = 100
export const DENOMINACIONES_EFECTIVO = [10, 20, 50, 100, 200]

export function calcularResumenPagos(
  pagos: PagoLinea[] = [],
  efectivoRecibido: number = 0,
  total: number = 0
): ResumenPagosCalculado {
  const sumaPagos = pagos.reduce((s, p) => s + (p.monto || 0), 0)
  const efectivoAplicado = pagos
    .filter((p) => p.medioPago === 'EFECTIVO')
    .reduce((s, p) => s + (p.monto || 0), 0)

  const vuelto = Math.max(0, efectivoRecibido - efectivoAplicado)
  const saldo = Math.max(0, total - sumaPagos)
  const montosCoinciden = total === 0 || Math.abs(sumaPagos - total) <= 0.01

  return { sumaPagos, efectivoAplicado, vuelto, saldo, montosCoinciden }
}

export function calcularResumenVenta(
  precioUnit: number,
  ninos: NinoVenta[],
  promocion?: Promocion,
  pagos: PagoLinea[] = [],
  efectivoRecibido: number = 0
): ResumenVentaCalculado {
  const subtotal = precioUnit * ninos.length
  let descuento = 0

  if (promocion?.activo) {
    if (promocion.tipoPromocion === 'DESCUENTO_PORCENTAJE') {
      descuento = (subtotal * (promocion.valorDescuento ?? 0)) / 100
    } else if (promocion.tipoPromocion === 'DESCUENTO_MONTO_FIJO') {
      descuento = promocion.valorDescuento ?? 0
    } else if (promocion.tipoPromocion === 'ENTRADA_GRATUITA') {
      descuento = subtotal
    }
  }

  const total = Math.max(0, subtotal - descuento)
  const resumenPagos = calcularResumenPagos(pagos, efectivoRecibido, total)

  return {
    subtotal,
    descuento,
    total,
    ...resumenPagos,
  }
}

export function formatNumberInput(value: string | number): number {
  if (value === '') return 0
  const parsed = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(parsed) ? 0 : parsed
}
