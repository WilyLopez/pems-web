'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { ApiResponse, PagedResponse } from '@/types/api.types'
import { AuditoriaFiltros, LogAuditoria } from '@/types/auditoria.types'

export function useAuditoria(filtros: AuditoriaFiltros, page: number) {
  return useQuery({
    queryKey: ['auditoria', filtros, page],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PagedResponse<LogAuditoria>>>('/auditoria', {
        params: {
          desde: `${filtros.desde}T00:00:00`,
          hasta: `${filtros.hasta}T23:59:59`,
          idUsuario: filtros.idUsuario || undefined,
          modulo: filtros.modulo || undefined,
          accion: filtros.accion || undefined,
          entidad: filtros.entidad || undefined,
          pagina: page,
          tamano: 20,
        },
      })
      return data.data
    },
  })
}

export function useLogDetalle(id: number | null) {
  return useQuery({
    queryKey: ['auditoria', 'detalle', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<LogAuditoria>>(`/auditoria/${id}`)
      return data.data
    },
    enabled: id !== null,
  })
}
