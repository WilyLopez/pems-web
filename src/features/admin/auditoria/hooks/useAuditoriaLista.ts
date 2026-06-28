'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { auditoriaApi } from '../services/auditoria.api'
import { AuditoriaFiltros } from '../types'

export function useAuditoriaLista(filtros: AuditoriaFiltros, page: number) {
  return useQuery({
    queryKey: ['auditoria', 'lista', filtros, page],
    queryFn: () => auditoriaApi.listar(filtros, page),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}
