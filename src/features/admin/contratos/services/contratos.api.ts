import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { Contrato } from '../types'

export interface ListarContratosParams {
  page?: number
  size?: number
  idSede?: number
  fechaEvento?: string
  sort?: string
}

export const contratosApi = {
  listar: async (
    params: ListarContratosParams = {}
  ): Promise<PagedResponse<Contrato>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Contrato>>>(
      '/contratos',
      { params }
    )
    return data.data
  },

  obtener: async (id: number): Promise<Contrato> => {
    const { data } = await api.get<ApiResponse<Contrato>>(`/contratos/${id}`)
    return data.data
  },

  obtenerPorEvento: async (idEvento: number): Promise<Contrato> => {
    const { data } = await api.get<ApiResponse<Contrato>>(
      `/contratos/eventos/${idEvento}`
    )
    return data.data
  },

  cargar: async (idEvento: number, archivo: File): Promise<Contrato> => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    const { data } = await api.post<ApiResponse<Contrato>>(
      `/contratos/eventos/${idEvento}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.data
  },
}
