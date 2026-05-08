import api from './api'
import { ApiResponse } from '@/types/api.types'

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
  titulo: string
  descripcion?: string
  imagenUrl: string
  enlaceDestino?: string
  fechaInicio: string
  fechaFin?: string
  activo: boolean
  orden: number
}

export const cmsService = {
  editarContenido: async (id: number, valorEs: string, valorEn?: string): Promise<ContenidoWeb> => {
    const { data } = await api.put<ApiResponse<ContenidoWeb>>(`/contenido/${id}`, { valorEs, valorEn })
    return data.data
  },

  listarResenas: async (pendientes = false): Promise<Resena[]> => {
    const { data } = await api.get<ApiResponse<Resena[]>>('/resenas', { params: { pendientes } })
    return data.data
  },

  aprobarResena: async (id: number): Promise<Resena> => {
    const { data } = await api.post<ApiResponse<Resena>>(`/resenas/${id}/aprobar`)
    return data.data
  },

  rechazarResena: async (id: number): Promise<void> => {
    await api.delete(`/resenas/${id}`)
  },

  listarBanners: async (): Promise<Banner[]> => {
    const { data } = await api.get<ApiResponse<Banner[]>>('/banners')
    return data.data
  },

  desactivarBanner: async (id: number): Promise<void> => {
    await api.delete(`/banners/${id}/desactivar`)
  },
}