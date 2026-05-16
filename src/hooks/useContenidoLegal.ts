'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { legalService } from '@/services/legal.service'
import { TipoLegal, ActualizarLegalPayload } from '@/types/legal.types'

export const LEGAL_KEY = ['legal']

export function useContenidoLegalPublico(tipo: TipoLegal) {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'publico', tipo],
    queryFn: () => legalService.obtenerPublico(tipo),
    staleTime: 10 * 60_000,
  })
}

export function useContenidoLegalAdmin() {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'admin'],
    queryFn: () => legalService.listarAdmin(),
    staleTime: 30_000,
  })
}

export function useContenidoLegalPorTipo(tipo: TipoLegal) {
  return useQuery({
    queryKey: [...LEGAL_KEY, tipo],
    queryFn: () => legalService.obtenerPorTipo(tipo),
    staleTime: 30_000,
  })
}

export function useActualizarLegal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      tipo,
      payload,
    }: {
      tipo: TipoLegal
      payload: ActualizarLegalPayload
    }) => legalService.actualizar(tipo, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LEGAL_KEY })
      toast.success(`Versión ${data.version} guardada.`)
    },
    onError: () => toast.error('No se pudo guardar el contenido legal.'),
  })
}
