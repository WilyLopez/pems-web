import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import {
  SeccionWeb,
  ContenidoWeb,
  ActualizarContenidoWebPayload,
} from '@/types/cms.types'

export const seccionWebService = {
  listarVisibles: async (): Promise<SeccionWeb[]> => {
    const { data } = await api.get<ApiResponse<SeccionWeb[]>>(
      '/cms/secciones/publico'
    )
    return data.data
  },

  listarAdmin: async (): Promise<SeccionWeb[]> => {
    const { data } = await api.get<ApiResponse<SeccionWeb[]>>('/cms/secciones')
    return data.data
  },

  listarContenido: async (
    page = 0,
    size = 20,
    clave?: string,
    seccionCodigo?: string
  ): Promise<PagedResponse<ContenidoWeb>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<ContenidoWeb>>>('/contenido', {
      params: { page, size, clave: clave || undefined, seccionCodigo },
    })
    return data.data
  },

  actualizarContenido: async (
    id: number,
    payload: ActualizarContenidoWebPayload
  ): Promise<ContenidoWeb> => {
    const { data } = await api.put<ApiResponse<ContenidoWeb>>(
      `/contenido/${id}`,
      payload
    )
    return data.data
  },
}
