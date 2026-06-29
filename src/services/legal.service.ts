import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  ContenidoLegal,
  ContenidoLegalResumen,
  ContenidoLegalHistorialItem,
  TipoLegalCatalogo,
  ActualizarContenidoLegalPayload,
  CrearContenidoLegalPayload,
} from '@/types/legal.types'

export const legalService = {
  obtenerPublico: async (tipo: string): Promise<ContenidoLegal> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal>>(
      `/cms/legal/publico/${tipo}`
    )
    return data.data
  },

  listarPublico: async (): Promise<ContenidoLegalResumen[]> => {
    const { data } =
      await api.get<ApiResponse<ContenidoLegalResumen[]>>('/cms/legal/publico')
    return data.data
  },

  obtenerPublicoPorSlug: async (slug: string): Promise<ContenidoLegal> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal>>(
      `/cms/legal/publico/slug/${slug}`
    )
    return data.data
  },

  listarAdmin: async (): Promise<ContenidoLegal[]> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal[]>>('/cms/legal')
    return data.data
  },

  listarTipos: async (): Promise<TipoLegalCatalogo[]> => {
    const { data } =
      await api.get<ApiResponse<TipoLegalCatalogo[]>>('/cms/legal/tipos')
    return data.data
  },

  listarHistorial: async (
    tipo: string
  ): Promise<ContenidoLegalHistorialItem[]> => {
    const { data } = await api.get<ApiResponse<ContenidoLegalHistorialItem[]>>(
      `/cms/legal/${tipo}/historial`
    )
    return data.data
  },

  obtenerPorTipo: async (tipo: string): Promise<ContenidoLegal> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}`
    )
    return data.data
  },

  actualizar: async (
    tipo: string,
    payload: ActualizarContenidoLegalPayload
  ): Promise<ContenidoLegal> => {
    const { data } = await api.put<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}`,
      payload
    )
    return data.data
  },

  crear: async (
    payload: CrearContenidoLegalPayload
  ): Promise<ContenidoLegal> => {
    const { data } = await api.post<ApiResponse<ContenidoLegal>>(
      '/cms/legal',
      payload
    )
    return data.data
  },

  activar: async (tipo: string): Promise<ContenidoLegal> => {
    const { data } = await api.patch<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}/activar`
    )
    return data.data
  },

  desactivar: async (tipo: string): Promise<ContenidoLegal> => {
    const { data } = await api.patch<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}/desactivar`
    )
    return data.data
  },

  eliminar: async (tipo: string): Promise<void> => {
    await api.delete(`/cms/legal/${tipo}`)
  },
}
