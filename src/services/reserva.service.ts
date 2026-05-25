import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  Reserva,
  MetricasReserva,
  CrearReservaPayload,
  ReprogramarReservaPayload,
} from '@/types/reserva.types'

export interface BuscarReservasParams {
  page?: number
  size?: number
  idSede?: number
  estado?: string
  fecha?: string
  ingresado?: boolean
  esReprogramacion?: boolean
  search?: string
  sort?: string
}

export const reservaService = {
  listar: async (params: {
    page?: number
    size?: number
    estado?: string
    idSede?: number
    fecha?: string
  }): Promise<PagedResponse<Reserva>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Reserva>>>(
      '/reservas',
      { params }
    )
    return data.data
  },

  buscarAdmin: async (
    params: BuscarReservasParams
  ): Promise<PagedResponse<Reserva>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Reserva>>>(
      '/reservas/admin',
      { params }
    )
    return data.data
  },

  metricas: async (
    idSede?: number,
    fecha?: string
  ): Promise<MetricasReserva> => {
    const { data } = await api.get<ApiResponse<MetricasReserva>>(
      '/reservas/admin/metricas',
      { params: { idSede, fecha } }
    )
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

  reprogramar: async (
    idReserva: number,
    payload: ReprogramarReservaPayload
  ): Promise<Reserva> => {
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

  confirmarIngreso: async (idReserva: number): Promise<Reserva> => {
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${idReserva}/ingreso`
    )
    return data.data
  },

  subirComprobante: async (idReserva: number, archivo: File): Promise<Reserva> => {
    const form = new FormData()
    form.append('archivo', archivo)
    const { data } = await api.post<ApiResponse<Reserva>>(
      `/reservas/${idReserva}/comprobante`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },
}
