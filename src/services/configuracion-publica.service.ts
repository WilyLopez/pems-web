import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  ConfiguracionPublica,
  ActualizarConfiguracionPayload,
} from '@/types/configuracion-publica.types'

export const configuracionPublicaService = {
  obtenerPublica: async (): Promise<ConfiguracionPublica> => {
    const { data } = await api.get<ApiResponse<ConfiguracionPublica>>(
      '/cms/configuracion/publica'
    )
    return data.data
  },

  obtenerAdmin: async (): Promise<ConfiguracionPublica> => {
    const { data } =
      await api.get<ApiResponse<ConfiguracionPublica>>('/cms/configuracion')
    return data.data
  },

  actualizar: async (
    payload: ActualizarConfiguracionPayload
  ): Promise<ConfiguracionPublica> => {
    const { data } = await api.put<ApiResponse<ConfiguracionPublica>>(
      '/cms/configuracion',
      payload
    )
    return data.data
  },
}
