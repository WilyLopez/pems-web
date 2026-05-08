import api from './api'
import { ApiResponse } from '@/types/api.types'
import { AlertaStock, Producto, MovimientoInventarioPayload } from '@/types/inventario.types'

export const inventarioService = {
  getAlertasStock: async (idSede: number): Promise<AlertaStock[]> => {
    const { data } = await api.get<ApiResponse<AlertaStock[]>>(
      `/productos/sedes/${idSede}/alertas-stock`
    )
    return data.data
  },

  registrarMovimiento: async (
    idProducto: number,
    tipo: 'entrada' | 'salida' | 'ajuste',
    payload: MovimientoInventarioPayload
  ): Promise<Producto> => {
    const { data } = await api.post<ApiResponse<Producto>>(
      `/inventario/productos/${idProducto}/${tipo}`,
      payload
    )
    return data.data
  },
}