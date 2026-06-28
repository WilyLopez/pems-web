import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { NovedadLocal } from '@/types/comercial.types'
import { ApiResponse } from '@/types/api.types'

export function useNovedades() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.novedades,
    queryFn: async () => {
      const response = await api.get<ApiResponse<NovedadLocal[]>>(
        '/api/v1/novedades/home'
      )
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
