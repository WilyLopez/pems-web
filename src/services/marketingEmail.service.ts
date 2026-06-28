import api from './api'
import {
  CorreoMarketing,
  CrearCorreoMarketingPayload,
  ActualizarCorreoMarketingPayload,
  TipoEmail,
} from '@/types/marketing.types'
import { ApiResponse, PagedResponse } from '@/types/api.types'

export const marketingEmailService = {
  listarTiposMarketing: async (): Promise<TipoEmail[]> => {
    const { data } = await api.get<ApiResponse<TipoEmail[]>>(
      '/marketing/tipos-email'
    )
    return data.data.filter((t) => !t.esSistema)
  },

  listar: async (
    page = 0,
    size = 20
  ): Promise<PagedResponse<CorreoMarketing>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<CorreoMarketing>>>(
      '/marketing/correos',
      { params: { page, size } }
    )
    return data.data
  },

  getById: async (id: number): Promise<CorreoMarketing> => {
    const { data } = await api.get<ApiResponse<CorreoMarketing>>(
      `/marketing/correos/${id}`
    )
    return data.data
  },

  crear: async (
    payload: CrearCorreoMarketingPayload
  ): Promise<CorreoMarketing> => {
    const { data } = await api.post<ApiResponse<CorreoMarketing>>(
      '/marketing/correos',
      payload
    )
    return data.data
  },

  actualizar: async (
    id: number,
    payload: ActualizarCorreoMarketingPayload
  ): Promise<CorreoMarketing> => {
    const { data } = await api.put<ApiResponse<CorreoMarketing>>(
      `/marketing/correos/${id}`,
      payload
    )
    return data.data
  },

  toggleEstado: async (id: number, activa: boolean): Promise<void> => {
    await api.patch(`/marketing/correos/${id}/estado`, null, {
      params: { activa },
    })
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/marketing/correos/${id}`)
  },
}
