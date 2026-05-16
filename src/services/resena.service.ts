import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  Resena,
  SubmitResenaPayload,
  ResponderResenaPayload,
} from '@/types/resena.types'

export const resenaService = {
  listar: async (
    pendientes = false,
    page = 0,
    size = 20
  ): Promise<PagedResponse<Resena>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Resena>>>(
      '/resenas',
      {
        params: { pendientes, page, size },
      }
    )
    return data.data
  },

  submit: async (payload: SubmitResenaPayload): Promise<Resena> => {
    const { data } = await api.post<ApiResponse<Resena>>('/resenas', payload)
    return data.data
  },

  aprobar: async (id: number): Promise<Resena> => {
    const { data } = await api.post<ApiResponse<Resena>>(
      `/resenas/${id}/aprobar`
    )
    return data.data
  },

  rechazar: async (id: number): Promise<void> => {
    await api.delete(`/resenas/${id}`)
  },

  responder: async (
    id: number,
    payload: ResponderResenaPayload
  ): Promise<Resena> => {
    const { data } = await api.post<ApiResponse<Resena>>(
      `/resenas/${id}/responder`,
      payload
    )
    return data.data
  },

  destacar: async (id: number): Promise<void> => {
    await api.patch(`/resenas/${id}/destacar`)
  },

  quitarDestacado: async (id: number): Promise<void> => {
    await api.patch(`/resenas/${id}/quitar-destacado`)
  },

  toggleHome: async (id: number, mostrar: boolean): Promise<void> => {
    await api.patch(`/resenas/${id}/home`, null, { params: { mostrar } })
  },
}
