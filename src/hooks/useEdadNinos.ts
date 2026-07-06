'use client'

import { useQuery } from '@tanstack/react-query'
import { configuracionSistemaService } from '@/services/configuracion-sistema.service'

export const EDAD_MIN_DEFECTO = 1
export const EDAD_MAX_DEFECTO = 12

function aNumero(valor: string | undefined, defecto: number): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : defecto
}

export function useEdadNinos() {
  const { data } = useQuery({
    queryKey: ['configuracion-sistema-publica'],
    queryFn: () => configuracionSistemaService.obtenerPublicas(),
    staleTime: 5 * 60 * 1000,
  })

  return {
    edadMin: aNumero(data?.EDAD_MIN_NINO, EDAD_MIN_DEFECTO),
    edadMax: aNumero(data?.EDAD_MAX_NINO, EDAD_MAX_DEFECTO),
  }
}
