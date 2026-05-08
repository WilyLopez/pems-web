import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Reserva, CrearReservaPayload, ReprogramarReservaPayload } from '@/types/reserva.types'

export const reservaService = {
  listar: async (params: {
    page?: number
    size?: number
    estado?: string
    idSede?: number
    fecha?: string
  }): Promise<PagedResponse<Reserva>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Reserva>>>('/reservas', { params })
    return data.data
  },

  crear: async (
    idCliente: number,
    idSede: number,
    payload: CrearReservaPayload
  ): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/clientes/${idCliente}/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  reprogramar: async (idReserva: number, payload: ReprogramarReservaPayload): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${idReserva}/reprogramar`,
      payload
    )
    return data.data
  },

  cancelar: async (idReserva: number, motivo: string): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${idReserva}/cancelar?motivo=${encodeURIComponent(motivo)}`
    )
    return data.data
  },
}