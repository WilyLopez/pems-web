'use client'

import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { seccionWebService } from '@/services/seccion-web.service'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'

export function useContenidoPublico() {
  const { data } = useQuery({
    queryKey: PUBLIC_QUERY_KEYS.contenido,
    queryFn: () => seccionWebService.listarContenidoPublico(),
    staleTime: 5 * 60 * 1000,
  })

  const mapa = useMemo(
    () => new Map((data ?? []).map((c) => [c.clave, c.valorEs])),
    [data]
  )

  const texto = useCallback(
    (clave: string, fallback: string) => mapa.get(clave) ?? fallback,
    [mapa]
  )

  return { texto }
}
