import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { PaqueteEvento } from '@/types/comercial.types'
import { ApiResponse } from '@/types/api.types'

export function usePaquetes() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.paquetes,
    queryFn: async () => {
      const response =
        await api.get<ApiResponse<PaqueteEvento[]>>('/api/v1/paquetes')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
