import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { Banner } from '@/types/banner.types'
import { ApiResponse } from '@/types/api.types'

export function useBanners(idSede?: number) {
  return useQuery({
    queryKey: idSede ? [...PUBLIC_QUERY_KEYS.banners, idSede] : PUBLIC_QUERY_KEYS.banners,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Banner[]>>('/api/v1/banners/publico', {
        params: idSede ? { idSede } : undefined,
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
