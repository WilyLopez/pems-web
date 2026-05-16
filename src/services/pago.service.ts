import api from './api'
import { ApiResponse } from '@/types/api.types'
import { Pago, RegistrarPagoPayload } from '@/types/pago.types'

export const pagoService = {
  registrarReserva: async (payload: RegistrarPagoPayload): Promise<Pago> => {
    const { data } = await api.post<ApiResponse<Pago>>(
      '/pagos/reserva',
      payload
    )
    return data.data
  },

  registrarAdelanto: async (payload: RegistrarPagoPayload): Promise<Pago> => {
    const { data } = await api.post<ApiResponse<Pago>>(
      '/pagos/evento/adelanto',
      payload
    )
    return data.data
  },

  registrarVenta: async (payload: RegistrarPagoPayload): Promise<Pago> => {
    const { data } = await api.post<ApiResponse<Pago>>('/pagos/venta', payload)
    return data.data
  },
}
