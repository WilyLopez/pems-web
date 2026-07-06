import { useQuery } from '@tanstack/react-query'
import { promocionService } from '@/services/promocion.service'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'

export function usePromocionesPublicas() {
  return useQuery({
    queryKey: PUBLIC_QUERY_KEYS.promociones,
    queryFn: () => promocionService.listarPublicas(),
    staleTime: 5 * 60 * 1000,
  })
}
