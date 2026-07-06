import api from './api'
import { ApiResponse } from '@/types/api.types'

export const configuracionSistemaService = {
  obtenerPublicas: async (): Promise<Record<string, string>> => {
    const { data } = await api.get<ApiResponse<Record<string, string>>>(
      '/configuracion/publica'
    )
    return data.data
  },
}
