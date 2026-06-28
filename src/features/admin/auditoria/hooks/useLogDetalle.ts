'use client'

import { useQuery } from '@tanstack/react-query'
import { auditoriaApi } from '../services/auditoria.api'

export function useLogDetalle(id: number | null) {
  return useQuery({
    queryKey: ['auditoria', 'detalle', id],
    queryFn: () => auditoriaApi.obtener(id!),
    enabled: id !== null,
    staleTime: 60_000,
  })
}
