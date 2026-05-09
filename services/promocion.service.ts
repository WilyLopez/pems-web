import api from './api'
import { ApiResponse } from '@/types/api.types'
import { TipoPromocion, TipoDia } from '@/types/enums'

export interface Promocion {
  id: number
  tipoPromocion: string
  idSede?: number
  nombre: string
  descripcion?: string
  valorDescuento: number
  condicion?: string
  minimoPersonas?: number
  soloTipoDia?: string
  fechaInicio: string
  fechaFin?: string
  activo: boolean
  esAutomatica: boolean
  fechaCreacion: string

  // Marketing visual
  imagenUrl?: string
  bannerUrl?: string
  colorDestacado?: string
  prioridad: number
  textoPublicitario?: string
  textoBoton?: string
  urlBoton?: string

  // Zonas de publicación web
  mostrarEnInicio: boolean
  mostrarEnCarrusel: boolean
  mostrarEnPaginaPromociones: boolean
  mostrarEnCheckout: boolean
  mostrarDestacado: boolean
  soloMovil: boolean

  // Límites
  limiteUsos?: number
  limitePorCliente?: number
  minimoAsistentes?: number
  montoMinimo?: number

  // Analítica (solo lectura)
  vecesUsado: number
  montoAhorrado: number
  clientesAtraidos: number
}

export interface EstadisticasPromocion {
  totalActivas: number
  totalInactivas: number
  totalPorVencer: number
  topPromociones: Array<{ id: number; nombre: string; vecesUsado: number; montoAhorrado: number }>
  totalDescuentoOtorgado: number
  totalClientesAlcanzados: number
}

export interface CrearPromocionPayload {
  tipoPromocion: TipoPromocion
  idSede?: number
  nombre: string
  descripcion?: string
  valorDescuento: number
  condicion?: string
  minimoPersonas?: number
  soloTipoDia?: TipoDia
  fechaInicio: string
  fechaFin?: string
  esAutomatica: boolean

  imagenUrl?: string
  bannerUrl?: string
  colorDestacado?: string
  prioridad?: number
  textoPublicitario?: string
  textoBoton?: string
  urlBoton?: string

  mostrarEnInicio?: boolean
  mostrarEnCarrusel?: boolean
  mostrarEnPaginaPromociones?: boolean
  mostrarEnCheckout?: boolean
  mostrarDestacado?: boolean
  soloMovil?: boolean

  limiteUsos?: number
  limitePorCliente?: number
  minimoAsistentes?: number
  montoMinimo?: number
}

export type ActualizarPromocionPayload = Partial<CrearPromocionPayload>

export const promocionService = {
  listar: async (): Promise<Promocion[]> => {
    const { data } = await api.get<ApiResponse<Promocion[]>>('/promociones')
    return data.data
  },

  listarPublicas: async (): Promise<Promocion[]> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/promociones/publicas`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as Promocion[]) ?? []
  },

  obtenerPorId: async (id: number): Promise<Promocion> => {
    const { data } = await api.get<ApiResponse<Promocion>>(`/promociones/${id}`)
    return data.data
  },

  crear: async (payload: CrearPromocionPayload): Promise<Promocion> => {
    const { data } = await api.post<ApiResponse<Promocion>>('/promociones', payload)
    return data.data
  },

  actualizar: async (id: number, payload: ActualizarPromocionPayload): Promise<Promocion> => {
    const { data } = await api.put<ApiResponse<Promocion>>(`/promociones/${id}`, payload)
    return data.data
  },

  desactivar: async (id: number): Promise<void> => {
    await api.delete(`/promociones/${id}`)
  },

  estadisticas: async (): Promise<EstadisticasPromocion> => {
    const { data } = await api.get<ApiResponse<EstadisticasPromocion>>('/promociones/estadisticas')
    return data.data
  },
}
