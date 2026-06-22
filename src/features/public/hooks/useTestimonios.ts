import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { Resena, SubmitResenaPayload } from '@/types/resena.types'
import { ApiResponse, PagedResponse } from '@/types/api.types'

export function useTestimonios(page = 0, size = 20) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.testimonios, page, size],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PagedResponse<Resena>>>('/api/v1/resenas/publicas', {
        params: { page, size },
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubmitResena() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: SubmitResenaPayload) => {
      const response = await api.post<ApiResponse<Resena>>('/api/v1/resenas', payload)
      return response.data.data
    },
    onSuccess: () => {
      // Invalidate both testimonios keys
      queryClient.invalidateQueries({ queryKey: PUBLIC_QUERY_KEYS.testimonios })
    },
  })
}
