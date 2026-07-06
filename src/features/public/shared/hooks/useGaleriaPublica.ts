'use client'

import { useQuery } from '@tanstack/react-query'
import { galeriaPublicaService } from '@/services/galeria.public.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'

export function useGaleriaPublica(soloDestacadas = false, size = 12) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.galeriaPublica({ soloDestacadas }),
    queryFn: () => galeriaPublicaService.listar(size, soloDestacadas),
    staleTime: 5 * 60 * 1000,
  })
}
