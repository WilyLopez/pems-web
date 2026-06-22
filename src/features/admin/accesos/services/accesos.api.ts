import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { TicketDetalle } from '../types'

export const accesosApi = {
  buscarTicketDetalle: async (numeroTicket: string): Promise<TicketDetalle> => {
    const { data } = await api.get<ApiResponse<TicketDetalle>>(
      `/reservas/control-acceso/ticket/${encodeURIComponent(numeroTicket)}`
    )
    return data.data
  },

  marcarEntrada: async (idReserva: number): Promise<TicketDetalle> => {
    const { data } = await api.post<ApiResponse<TicketDetalle>>(
      `/reservas/control-acceso/${idReserva}/marcar-entrada`
    )
    return data.data
  },

  editarFechaTicket: async (
    idReserva: number,
    nuevaFecha: string
  ): Promise<TicketDetalle> => {
    const { data } = await api.patch<ApiResponse<TicketDetalle>>(
      `/reservas/control-acceso/${idReserva}/fecha`,
      null,
      { params: { nuevaFecha } }
    )
    return data.data
  },
}
