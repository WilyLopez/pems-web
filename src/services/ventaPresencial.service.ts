import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  PrecioDia,
  RegistrarVentaMostradorPayload,
  TicketDetalle,
  VentaMostradorResponse,
} from '@/types/ventaPresencial.types'

export const ventaPresencialService = {
  precioDia: async (idSede: number, fecha: string): Promise<PrecioDia> => {
    const { data } = await api.get<ApiResponse<PrecioDia>>(
      `/tarifas/sedes/${idSede}`,
      { params: { fecha } }
    )
    return data.data
  },

  registrar: async (
    payload: RegistrarVentaMostradorPayload
  ): Promise<VentaMostradorResponse> => {
    const { data } = await api.post<ApiResponse<VentaMostradorResponse>>(
      '/ventas-mostrador',
      payload
    )
    return data.data
  },

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
