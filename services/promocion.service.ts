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
}

export const promocionService = {
  listar: async (): Promise<Promocion[]> => {
    const { data } = await api.get<ApiResponse<Promocion[]>>('/promociones')
    return data.data
  },

  crear: async (payload: CrearPromocionPayload): Promise<Promocion> => {
    const { data } = await api.post<ApiResponse<Promocion>>('/promociones', payload)
    return data.data
  },

  desactivar: async (id: number): Promise<void> => {
    await api.delete(`/promociones/${id}`)
  },
}