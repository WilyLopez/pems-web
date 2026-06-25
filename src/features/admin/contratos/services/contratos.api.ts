import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  Contrato,
  DocumentoContrato,
  GenerarContratoPayload,
  ActualizarContratoPayload,
  CambiarEstadoPayload,
} from '../types'

export interface ListarContratosParams {
  page?: number
  size?: number
  search?: string
  estado?: string
  idSede?: number
  fechaEvento?: string
  sort?: string
}

export const contratosApi = {
  listar: async (params: ListarContratosParams = {}): Promise<PagedResponse<Contrato>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Contrato>>>('/contratos', { params })
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

  generar: async (idEvento: number, payload?: GenerarContratoPayload): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(
      `/contratos/eventos/${idEvento}`,
      payload ?? {}
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
    const { data } = await api.post<ApiResponse<Contrato>>(`/contratos/${id}/estado`, payload)
    return data.data
  },

  reemplazar: async (id: number): Promise<Contrato> => {
    const { data } = await api.post<ApiResponse<Contrato>>(`/contratos/${id}/reemplazar`)
    return data.data
  },

  subirDocumento: async (id: number, archivo: File): Promise<DocumentoContrato> => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    const { data } = await api.post<ApiResponse<DocumentoContrato>>(
      `/contratos/${id}/documentos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },
}
