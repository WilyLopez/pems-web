'use client'

import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useContenidoWeb, CONTENIDO_KEY } from '@/hooks/useContenidoWeb'
import { seccionWebService } from '@/services/seccion-web.service'
import { PUBLIC_QUERY_KEYS } from '@/features/public/shared/queryKeys'
import { ContenidoWeb } from '@/types/cms.types'

export function useContenidoMapa() {
  const query = useContenidoWeb(undefined, undefined, 0, 100)

  const mapa = useMemo(() => {
    const m = new Map<string, ContenidoWeb>()
    for (const item of query.data?.content ?? []) {
      m.set(item.clave, item)
    }
    return m
  }, [query.data])

  return {
    mapa,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export interface CambioBloque {
  id: number
  valorEs: string
}

export function useGuardarBloque() {
  const qc = useQueryClient()
  const [guardando, setGuardando] = useState(false)

  const guardar = useCallback(
    async (cambios: CambioBloque[]) => {
      if (cambios.length === 0) return true
      setGuardando(true)
      try {
        for (const cambio of cambios) {
          await seccionWebService.actualizarContenido(cambio.id, {
            valorEs: cambio.valorEs,
          })
        }
        qc.invalidateQueries({ queryKey: CONTENIDO_KEY })
        qc.invalidateQueries({ queryKey: PUBLIC_QUERY_KEYS.contenido })
        toast.success('Cambios guardados.')
        return true
      } catch {
        toast.error('No se pudieron guardar los cambios.')
        return false
      } finally {
        setGuardando(false)
      }
    },
    [qc]
  )

  return { guardar, guardando }
}
