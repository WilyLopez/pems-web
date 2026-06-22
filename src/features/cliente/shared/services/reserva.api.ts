import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Reserva, CrearReservaPayload } from '../types'

export const reservaApi = {
  listar: async (params: { page?: number; size?: number } = {}): Promise<PagedResponse<Reserva>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Reserva>>>('/reservas', { params })
    return data.data
  },

  crear: async (idCliente: number, idSede: number, payload: CrearReservaPayload): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(`/reservas/clientes/${idCliente}/sedes/${idSede}`, payload)
    return data.data
  },

  subirComprobante: async (idReserva: number, comprobante: File): Promise<void> => {
    const form = new FormData()
    form.append('archivo', comprobante)
    await api.post(`/reservas/${idReserva}/comprobante`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  reprogramar: async (idReserva: number, nuevaFecha: string): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(`/reservas/${idReserva}/reprogramar`, {
      nuevaFechaEvento: nuevaFecha,
    })
    return data.data
  },

  cancelar: async (idReserva: number, motivo: string): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(`/reservas/${idReserva}/cancelar`, null, {
      params: { motivo },
    })
    return data.data
  },
}
export type ReservaApi = typeof reservaApi
