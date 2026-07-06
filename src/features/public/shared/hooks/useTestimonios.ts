import { useQuery } from '@tanstack/react-query'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'
import { resenaService } from '@/services/resena.service'

export function useTestimonios(page = 0, size = 20) {
  return useQuery({
    queryKey: [...PUBLIC_QUERY_KEYS.testimonios, page, size],
    queryFn: () => resenaService.listarPublicas(page, size),
    staleTime: 5 * 60 * 1000,
  })
}
