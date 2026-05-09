import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Contrato } from '@/types/contrato.types'

export interface GenerarContratoPayload {
  contenidoTexto: string
  plantilla?:     string
}

export interface ActualizarContratoPayload {
  contenidoTexto: string
  plantilla?:     string
  observaciones?: string
}

export interface CambiarEstadoPayload {
  nuevoEstado: string
  motivo?:     string
}

export const contratoService = {
  listar: async (params: {
    page?:   number
    size?:   number
    search?: string
    estado?: string
    idSede?: number
  }): Promise<PagedResponse<Contrato>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Contrato>>>(
      '/contratos', { params },
    )
    return data.data
  },

  obtener: async (id: number): Promise<Contrato> => {
    const { data } = await api.get<ApiResponse<Contrato>>(`/contratos/${id}`)
    return data.data
  },

  obtenerPorEvento: async (idEvento: number): Promise<Contrato> => {
    const { data } = await api.get<ApiResponse<Contrato>>(`/contratos/eventos/${idEvento}`)
    return data.data
  },

  generar: async (idEvento: number, payload: GenerarContratoPayload): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(
      `/contratos/eventos/${idEvento}`, payload,
    )
    return data.data
  },

  actualizar: async (id: number, payload: ActualizarContratoPayload): Promise<Contrato> => {
    const { data } = await api.put<ApiResponse<Contrato>>(`/contratos/${id}`, payload)
    return data.data
  },

  firmar: async (id: number): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(`/contratos/${id}/firmar`)
    return data.data
  },

  cambiarEstado: async (id: number, payload: CambiarEstadoPayload): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(
      `/contratos/${id}/estado`, payload,
    )
    return data.data
  },
}