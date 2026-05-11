import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { EventoPrivado, ChecklistItem, SolicitarEventoPayload } from '@/types/evento.types'

export interface BuscarEventosParams {
  page?:   number
  size?:   number
  idSede?: number
  estado?: string
  fecha?:  string
  search?: string
  sort?:   string
}

export const eventoService = {
  listar: async (params: {
    page?: number; size?: number; estado?: string; idSede?: number
  }): Promise<PagedResponse<EventoPrivado>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EventoPrivado>>>(
      '/eventos-privados', { params })
    return data.data
  },

  buscarAdmin: async (params: BuscarEventosParams): Promise<PagedResponse<EventoPrivado>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EventoPrivado>>>(
      '/eventos-privados/admin', { params })
    return data.data
  },

  obtener: async (id: number): Promise<EventoPrivado> => {
    const { data } = await api.get<ApiResponse<EventoPrivado>>(`/eventos-privados/${id}`)
    return data.data
  },

  confirmar: async (id: number, precioTotal: number): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/confirmar?precioTotal=${precioTotal}`)
    return data.data
  },

  cancelar: async (id: number, motivo: string): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/${id}/cancelar?motivoCancelacion=${encodeURIComponent(motivo)}`)
    return data.data
  },

  solicitar: async (idCliente: number, idSede: number,
    payload: SolicitarEventoPayload): Promise<EventoPrivado> => {
    const { data } = await api.post<ApiResponse<EventoPrivado>>(
      `/eventos-privados/clientes/${idCliente}/sedes/${idSede}`, payload)
    return data.data
  },

  listarChecklist: async (idEvento: number): Promise<ChecklistItem[]> => {
    const { data } = await api.get<ApiResponse<ChecklistItem[]>>(
      `/eventos-privados/${idEvento}/checklist`)
    return data.data
  },

  completarTarea: async (idEvento: number, idChecklist: number): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/completar`)
    return data.data
  },

  descompletarTarea: async (idEvento: number, idChecklist: number): Promise<ChecklistItem> => {
    const { data } = await api.post<ApiResponse<ChecklistItem>>(
      `/eventos-privados/${idEvento}/checklist/${idChecklist}/descompletar`)
    return data.data
  },
}