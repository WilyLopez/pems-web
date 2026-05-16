import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  ContenidoLegal,
  ActualizarLegalPayload,
  TipoLegal,
} from '@/types/legal.types'

export const legalService = {
  obtenerPublico: async (tipo: TipoLegal): Promise<ContenidoLegal> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal>>(
      `/cms/legal/publico/${tipo}`
    )
    return data.data
  },

  listarAdmin: async (): Promise<ContenidoLegal[]> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal[]>>('/cms/legal')
    return data.data
  },

  obtenerPorTipo: async (tipo: TipoLegal): Promise<ContenidoLegal> => {
    const { data } = await api.get<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}`
    )
    return data.data
  },

  actualizar: async (
    tipo: TipoLegal,
    payload: ActualizarLegalPayload
  ): Promise<ContenidoLegal> => {
    const { data } = await api.put<ApiResponse<ContenidoLegal>>(
      `/cms/legal/${tipo}`,
      payload
    )
    return data.data
  },
}
