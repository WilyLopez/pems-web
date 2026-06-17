import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import {
  Reserva,
  MetricasReserva,
  BuscarReservasParams,
  PageableResponse,
} from '../types'

export const reservasApi = {
  buscarAdmin: async (
    params: BuscarReservasParams
  ): Promise<PageableResponse<Reserva>> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '')
    )
    const qs = new URLSearchParams(cleanParams as Record<string, string>).toString()
    const { data } = await api.get<ApiResponse<PageableResponse<Reserva>>>(
      `/reservas/admin?${qs}`
    )
    return data.data
  },

  metricas: async (idSede?: number, fecha?: string): Promise<MetricasReserva> => {
    const params = new URLSearchParams()
    if (idSede) params.append('idSede', idSede.toString())
    if (fecha) params.append('fecha', fecha)

    const { data } = await api.get<ApiResponse<MetricasReserva>>(
      `/reservas/admin/metricas?${params.toString()}`
    )
    return data.data
  },

  cancelar: async (id: number, motivo: string): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${id}/cancelar?motivo=${encodeURIComponent(motivo)}`
    )
    return data.data
  },

  confirmarIngreso: async (id: number): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(`/reservas/${id}/ingreso`)
    return data.data
  },

  confirmarPago: async (id: number, medioPago: string = 'YAPE'): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${id}/confirmar-pago?medioPago=${medioPago}`
    )
    return data.data
  },
}
