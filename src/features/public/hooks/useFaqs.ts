import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { PUBLIC_QUERY_KEYS } from '../shared/queryKeys'
import { Faq } from '@/types/faq.types'
import { ApiResponse } from '@/types/api.types'

export function useFaqs() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.faqs,
    queryFn: async () => {
      const response = await api.get<ApiResponse<Faq[]>>('/api/v1/cms/faqs/publico')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
