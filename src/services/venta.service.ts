import api from './api'
import { ApiResponse } from '@/types/api.types'

export interface LineaVenta {
  idProducto: number
  cantidad: number
}

export interface Venta {
  id: number
  idSede: number
  subtotal: number
  descuento: number
  total: number
  fechaVenta: string
  detalles: DetalleVenta[]
}

export interface DetalleVenta {
  idProducto: number
  nombreProducto: string
  cantidad: number
  precioUnitario: number
  subtotalLinea: number
}

export interface ProcesarVentaPayload {
  idReservaPublica?: number
  idEventoPrivado?: number
  lineas: LineaVenta[]
  descuento?: number
}

export const ventaService = {
  procesar: async (
    idSede: number,
    payload: ProcesarVentaPayload
  ): Promise<Venta> => {
    const { data } = await api.post<ApiResponse<Venta>>(
      `/ventas/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  obtener: async (id: number): Promise<Venta> => {
    const { data } = await api.get<ApiResponse<Venta>>(`/ventas/${id}`)
    return data.data
  },
}
