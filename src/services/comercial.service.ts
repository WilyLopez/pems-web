import api from './api'
import { ApiResponse } from '@/types/api.types'
import {
  PaqueteEvento,
  ZonaJuego,
  ActividadLocal,
  NovedadLocal,
  CrearPaquetePayload,
  ActualizarPaquetePayload,
  CrearZonaPayload,
  ActualizarZonaPayload,
  CrearActividadPayload,
  ActualizarActividadPayload,
  CrearNovedadPayload,
  ActualizarNovedadPayload,
} from '@/types/comercial.types'

export const comercialService = {
  paquetes: {
    listarActivos: async (): Promise<PaqueteEvento[]> => {
      const { data } = await api.get<ApiResponse<PaqueteEvento[]>>('/paquetes')
      return data.data
    },
    listarAdmin: async (): Promise<PaqueteEvento[]> => {
      const { data } = await api.get<ApiResponse<PaqueteEvento[]>>('/paquetes/admin')
      return data.data
    },
    crear: async (payload: CrearPaquetePayload): Promise<PaqueteEvento> => {
      const { data } = await api.post<ApiResponse<PaqueteEvento>>('/paquetes', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarPaquetePayload): Promise<PaqueteEvento> => {
      const { data } = await api.put<ApiResponse<PaqueteEvento>>(`/paquetes/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/paquetes/${id}`)
    },
    reordenar: async (id: number, nuevoOrden: number): Promise<PaqueteEvento> => {
      const { data } = await api.patch<ApiResponse<PaqueteEvento>>(
        `/paquetes/${id}/orden`,
        null,
        { params: { nuevoOrden } }
      )
      return data.data
    },
  },

  zonas: {
    listarActivas: async (): Promise<ZonaJuego[]> => {
      const { data } = await api.get<ApiResponse<ZonaJuego[]>>('/zonas')
      return data.data
    },
    listarAdmin: async (): Promise<ZonaJuego[]> => {
      const { data } = await api.get<ApiResponse<ZonaJuego[]>>('/zonas/admin')
      return data.data
    },
    crear: async (payload: CrearZonaPayload): Promise<ZonaJuego> => {
      const { data } = await api.post<ApiResponse<ZonaJuego>>('/zonas', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarZonaPayload): Promise<ZonaJuego> => {
      const { data } = await api.put<ApiResponse<ZonaJuego>>(`/zonas/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/zonas/${id}`)
    },
    agregarMedia: async (id: number, url: string, tipo: string): Promise<ZonaJuego> => {
      const { data } = await api.post<ApiResponse<ZonaJuego>>(
        `/zonas/${id}/media`,
        null,
        { params: { url, tipo } }
      )
      return data.data
    },
    eliminarMedia: async (id: number, url: string): Promise<ZonaJuego> => {
      const { data } = await api.delete<ApiResponse<ZonaJuego>>(
        `/zonas/${id}/media`,
        { params: { url } }
      )
      return data.data
    },
    reordenar: async (id: number, nuevoOrden: number): Promise<ZonaJuego> => {
      const { data } = await api.patch<ApiResponse<ZonaJuego>>(
        `/zonas/${id}/orden`,
        null,
        { params: { nuevoOrden } }
      )
      return data.data
    },
  },

  actividades: {
    listarActivas: async (): Promise<ActividadLocal[]> => {
      const { data } = await api.get<ApiResponse<ActividadLocal[]>>('/actividades')
      return data.data
    },
    listarEspeciales: async (): Promise<ActividadLocal[]> => {
      const { data } = await api.get<ApiResponse<ActividadLocal[]>>('/actividades/especiales')
      return data.data
    },
    listarAdmin: async (): Promise<ActividadLocal[]> => {
      const { data } = await api.get<ApiResponse<ActividadLocal[]>>('/actividades/admin')
      return data.data
    },
    crear: async (payload: CrearActividadPayload): Promise<ActividadLocal> => {
      const { data } = await api.post<ApiResponse<ActividadLocal>>('/actividades', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarActividadPayload): Promise<ActividadLocal> => {
      const { data } = await api.put<ApiResponse<ActividadLocal>>(`/actividades/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/actividades/${id}`)
    },
  },

  novedades: {
    listarActivas: async (): Promise<NovedadLocal[]> => {
      const { data } = await api.get<ApiResponse<NovedadLocal[]>>('/novedades')
      return data.data
    },
    listarHome: async (): Promise<NovedadLocal[]> => {
      const { data } = await api.get<ApiResponse<NovedadLocal[]>>('/novedades/home')
      return data.data
    },
    listarAdmin: async (): Promise<NovedadLocal[]> => {
      const { data } = await api.get<ApiResponse<NovedadLocal[]>>('/novedades/admin')
      return data.data
    },
    crear: async (payload: CrearNovedadPayload): Promise<NovedadLocal> => {
      const { data } = await api.post<ApiResponse<NovedadLocal>>('/novedades', payload)
      return data.data
    },
    actualizar: async (id: number, payload: ActualizarNovedadPayload): Promise<NovedadLocal> => {
      const { data } = await api.put<ApiResponse<NovedadLocal>>(`/novedades/${id}`, payload)
      return data.data
    },
    eliminar: async (id: number): Promise<void> => {
      await api.delete(`/novedades/${id}`)
    },
  },
}
