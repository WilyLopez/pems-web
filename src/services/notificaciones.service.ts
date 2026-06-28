import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  NotificacionDTO,
  ConteoNoLeidasDTO,
} from '@/types/notificaciones.types'

interface FeedParams {
  soloNoLeidas?: boolean
  page?: number
  size?: number
}

function makeFeed(base: string) {
  return {
    feed: async (
      params: FeedParams = {}
    ): Promise<PagedResponse<NotificacionDTO>> => {
      const { data } = await api.get<
        ApiResponse<PagedResponse<NotificacionDTO>>
      >(`${base}/feed`, { params })
      return data.data
    },
    count: async (): Promise<number> => {
      const { data } = await api.get<ApiResponse<ConteoNoLeidasDTO>>(
        `${base}/count`
      )
      return data.data.count
    },
    marcarLeida: async (id: number): Promise<void> => {
      await api.patch(`${base}/${id}/leida`)
    },
    marcarTodasLeidas: async (): Promise<void> => {
      await api.patch(`${base}/leidas`)
    },
  }
}

export const notificacionesAdminService = makeFeed('/notificaciones/admin/me')
export const notificacionesClienteService = makeFeed(
  '/notificaciones/cliente/me'
)
