import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { AuditoriaFiltros, LogAuditoria } from '../types'

export const auditoriaApi = {
  listar: async (filtros: AuditoriaFiltros, page: number) => {
    const { data } = await api.get<ApiResponse<PagedResponse<LogAuditoria>>>(
      '/auditoria',
      {
        params: {
          desde: `${filtros.desde}T00:00:00`,
          hasta: `${filtros.hasta}T23:59:59`,
          idUsuario: filtros.idUsuario || undefined,
          modulo: filtros.modulo || undefined,
          accion: filtros.accion || undefined,
          nivel: filtros.nivel || undefined,
          resultado: filtros.resultado || undefined,
          entidad: filtros.entidad || undefined,
          pagina: page,
          tamano: Math.min(filtros.tamano ?? 20, 100),
        },
      }
    )
    return data.data
  },

  obtener: async (id: number) => {
    const { data } = await api.get<ApiResponse<LogAuditoria>>(
      `/auditoria/${id}`
    )
    return data.data
  },
}
