import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import type {
  ConfiguracionSistema,
  ConfiguracionCalendario,
  ActualizarConfiguracionCalendarioRequest,
  Sede,
} from '../types'

export const configuracionApi = {
  listarGlobal: async (): Promise<ConfiguracionSistema[]> => {
    const { data } =
      await api.get<ApiResponse<ConfiguracionSistema[]>>('/configuracion')
    return data.data
  },

  actualizarGlobal: async (
    cambios: Record<string, string>
  ): Promise<ConfiguracionSistema[]> => {
    const { data } = await api.put<ApiResponse<ConfiguracionSistema[]>>(
      '/configuracion',
      cambios
    )
    return data.data
  },

  obtenerCalendario: async (
    idSede: number
  ): Promise<ConfiguracionCalendario> => {
    const { data } = await api.get<ApiResponse<ConfiguracionCalendario>>(
      `/calendario/configuracion/sedes/${idSede}`
    )
    return data.data
  },

  actualizarCalendario: async (
    idSede: number,
    payload: ActualizarConfiguracionCalendarioRequest
  ): Promise<ConfiguracionCalendario> => {
    const { data } = await api.put<ApiResponse<ConfiguracionCalendario>>(
      `/calendario/configuracion/sedes/${idSede}`,
      payload
    )
    return data.data
  },

  obtenerSede: async (idSede: number): Promise<Sede> => {
    const { data } = await api.get<ApiResponse<Sede>>(`/sedes/${idSede}`)
    return data.data
  },

  actualizarSede: async (
    idSede: number,
    values: Partial<Sede>
  ): Promise<Sede> => {
    const { data } = await api.put<ApiResponse<Sede>>(
      `/sedes/${idSede}`,
      values
    )
    return data.data
  },
}
