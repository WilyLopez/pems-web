import api from './api'
import { ApiResponse, PagedResponse } from '@/types/api.types'

export interface ContenidoWeb {
  id: number
  idSeccion: number
  clave: string
  valorEs: string
  valorEn?: string
  activo: boolean
  fechaActualizacion: string
}

export interface Resena {
  id: number
  nombreAutor: string
  contenido: string
  calificacion: number
  aprobada: boolean
  fechaCreacion: string
}

export interface Banner {
  id: number
  idSede?: number
  titulo: string
  descripcion?: string
  imagenUrl: string
  enlaceDestino?: string
  fechaInicio: string
  fechaFin?: string
  activo: boolean
  orden: number
  fechaCreacion?: string
}

export interface CrearBannerPayload {
  idSede?: number
  titulo: string
  descripcion?: string
  imagenUrl: string
  enlaceDestino?: string
  fechaInicio: string
  fechaFin?: string
  orden?: number
}

export interface ActualizarBannerPayload extends CrearBannerPayload {}

export const cmsService = {
  editarContenido: async (
    id: number,
    valorEs: string,
    valorEn?: string
  ): Promise<ContenidoWeb> => {
    const { data } = await api.put<ApiResponse<ContenidoWeb>>(
      `/contenido/${id}`,
      { valorEs, valorEn }
    )
    return data.data
  },

  listarResenas: async (pendientes = false): Promise<Resena[]> => {
    const { data } = await api.get<ApiResponse<Resena[]>>('/resenas', {
      params: { pendientes },
    })
    return data.data
  },

  aprobarResena: async (id: number): Promise<Resena> => {
    const { data } = await api.post<ApiResponse<Resena>>(
      `/resenas/${id}/aprobar`
    )
    return data.data
  },

  rechazarResena: async (id: number): Promise<void> => {
    await api.delete(`/resenas/${id}`)
  },

  listarBanners: async (
    page = 0,
    size = 20
  ): Promise<PagedResponse<Banner>> => {
    const { data } = await api.get<ApiResponse<PagedResponse<Banner>>>(
      '/banners',
      {
        params: { page, size },
      }
    )
    return data.data
  },

  obtenerBannersPublicos: async (idSede?: number): Promise<Banner[]> => {
    const { data } = await api.get<ApiResponse<Banner[]>>('/banners/publico', {
      params: idSede ? { idSede } : undefined,
    })
    return data.data
  },

  crearBanner: async (payload: CrearBannerPayload): Promise<Banner> => {
    const { data } = await api.post<ApiResponse<Banner>>('/banners', payload)
    return data.data
  },

  actualizarBanner: async (
    id: number,
    payload: ActualizarBannerPayload
  ): Promise<Banner> => {
    const { data } = await api.put<ApiResponse<Banner>>(
      `/banners/${id}`,
      payload
    )
    return data.data
  },

  activarBanner: async (id: number): Promise<void> => {
    await api.patch(`/banners/${id}/activar`)
  },

  desactivarBanner: async (id: number): Promise<void> => {
    await api.patch(`/banners/${id}/desactivar`)
  },

  duplicarBanner: async (id: number): Promise<Banner> => {
    const { data } = await api.post<ApiResponse<Banner>>(
      `/banners/${id}/duplicar`
    )
    return data.data
  },

  reordenarBanners: async (ids: number[]): Promise<void> => {
    await api.put('/banners/reordenar', { ids })
  },

  eliminarBanner: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}`)
  },
}
