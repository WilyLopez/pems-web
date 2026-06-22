import api from './api'

import {
  CampanaEmail,
  CrearCampanaPayload,
  CrearPlantillaPayload,
  CrearTipoEmailPayload,
  EnviarCampanaPayload,
  EnvioEmail,
  PlantillaEmail,
  TipoEmail,
} from '@/types/marketing.types'

import { ApiResponse, PagedResponse } from '@/types/api.types'

export const marketingService = {
  listarTipos: async (): Promise<TipoEmail[]> => {
    const { data } = await api.get<ApiResponse<TipoEmail[]>>(
      '/marketing/tipos-email'
    )
    return data.data
  },

  crearTipo: async (payload: CrearTipoEmailPayload): Promise<TipoEmail> => {
    const { data } = await api.post<ApiResponse<TipoEmail>>(
      '/marketing/tipos-email',
      payload
    )
    return data.data
  },

  eliminarTipo: async (codigo: string): Promise<void> => {
    await api.delete(`/marketing/tipos-email/${codigo}`)
  },

  listarPlantillas: async (
    page = 0,
    size = 20
  ): Promise<PlantillaEmail[]> => {
    const { data } = await api.get<ApiResponse<PlantillaEmail[]>>(
      '/marketing/plantillas',
      { params: { page, size } }
    )
    return data.data
  },

  crearPlantilla: async (
    payload: CrearPlantillaPayload
  ): Promise<PlantillaEmail> => {
    const { data } = await api.post<ApiResponse<PlantillaEmail>>(
      '/marketing/plantillas',
      payload
    )
    return data.data
  },

  listarCampanas: async (
    page = 0,
    size = 15
  ): Promise<PagedResponse<CampanaEmail>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<CampanaEmail>>>(
      '/marketing/campanas',
      { params: { page, size } }
    )
    return data.data
  },

  getCampanaById: async (id: number): Promise<CampanaEmail> => {
    const { data } = await api.get<ApiResponse<CampanaEmail>>(
      `/marketing/campanas/${id}`
    )
    return data.data
  },

  crearCampana: async (
    payload: CrearCampanaPayload
  ): Promise<CampanaEmail> => {
    const { data } = await api.post<ApiResponse<CampanaEmail>>(
      '/marketing/campanas',
      payload
    )
    return data.data
  },

  enviarCampana: async (
    id: number,
    filtro: EnviarCampanaPayload = {}
  ): Promise<void> => {
    await api.post(`/marketing/campanas/${id}/enviar`, filtro)
  },

  listarEnvios: async (
    idCampana: number,
    page = 0,
    size = 20
  ): Promise<PagedResponse<EnvioEmail>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<EnvioEmail>>>(
      `/marketing/campanas/${idCampana}/envios`,
      { params: { page, size } }
    )
    return data.data
  },
}
