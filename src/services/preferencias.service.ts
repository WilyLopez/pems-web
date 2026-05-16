import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  PreferenciaAdmin,
  UpdatePreferenciaPayload,
  PatchPreferenciaPayload,
} from '@/types/preferencias.types'

const BASE = '/admin/preferencias'

export const preferenciasService = {
  getMias: async (): Promise<PreferenciaAdmin> => {
    const { data } = await api.get<ApiResponse<PreferenciaAdmin>>(`${BASE}/me`)
    return data.data
  },

  actualizar: async (
    payload: UpdatePreferenciaPayload
  ): Promise<PreferenciaAdmin> => {
    const { data } = await api.put<ApiResponse<PreferenciaAdmin>>(
      `${BASE}/me`,
      payload
    )
    return data.data
  },

  parchear: async (
    payload: PatchPreferenciaPayload
  ): Promise<PreferenciaAdmin> => {
    const { data } = await api.patch<ApiResponse<PreferenciaAdmin>>(
      `${BASE}/me`,
      payload
    )
    return data.data
  },

  reset: async (): Promise<PreferenciaAdmin> => {
    const { data } = await api.post<ApiResponse<PreferenciaAdmin>>(
      `${BASE}/reset`
    )
    return data.data
  },
}
