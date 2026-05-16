import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  Banner,
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/types/banner.types'

export const bannerService = {
  listar: async (page = 0, size = 20): Promise<PagedResponse<Banner>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Banner>>>(
      '/banners',
      {
        params: { page, size },
      }
    )
    return data.data
  },

  obtenerPublicos: async (idSede?: number): Promise<Banner[]> => {
    const { data } = await api.get<ApiResponse<Banner[]>>('/banners/publico', {
      params: idSede ? { idSede } : undefined,
    })
    return data.data
  },

  crear: async (payload: CrearBannerPayload): Promise<Banner> => {
    const { data } = await api.post<ApiResponse<Banner>>('/banners', payload)
    return data.data
  },

  actualizar: async (
    id: number,
    payload: ActualizarBannerPayload
  ): Promise<Banner> => {
    const { data } = await api.put<ApiResponse<Banner>>(
      `/banners/${id}`,
      payload
    )
    return data.data
  },

  activar: async (id: number): Promise<void> => {
    await api.patch(`/banners/${id}/activar`)
  },

  desactivar: async (id: number): Promise<void> => {
    await api.patch(`/banners/${id}/desactivar`)
  },

  duplicar: async (id: number): Promise<Banner> => {
    const { data } = await api.post<ApiResponse<Banner>>(
      `/banners/${id}/duplicar`
    )
    return data.data
  },

  reordenar: async (ids: number[]): Promise<void> => {
    await api.put('/banners/reordenar', { ids })
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}`)
  },
}
