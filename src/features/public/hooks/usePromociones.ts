import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { Promocion } from '@/types/promocion.types'
import { ApiResponse } from '@/types/api.types'

export function usePromociones() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.promociones,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Promocion[]>>('/api/v1/promociones/publicas')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
