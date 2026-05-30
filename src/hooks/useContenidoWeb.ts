'use client'

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { seccionWebService } from '@/services/seccion-web.service'
import { ActualizarContenidoWebPayload } from '@/types/cms.types'

export const CONTENIDO_KEY = ['contenido-web']
export const SECCIONES_KEY = ['secciones-web']

export function useSeccionesWeb() {
  return useQuery({
    queryKey: SECCIONES_KEY,
    queryFn: () => seccionWebService.listarAdmin(),
    staleTime: 5 * 60_000,
  })
}

export function useContenidoWeb(
  clave?: string,
  idSeccion?: number,
  page = 0,
  size = 20
) {
  return useQuery({
    queryKey: [...CONTENIDO_KEY, clave, idSeccion, page, size],
    queryFn: () => seccionWebService.listarContenido(page, size, clave, idSeccion),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useActualizarContenidoWeb() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarContenidoWebPayload
    }) => seccionWebService.actualizarContenido(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONTENIDO_KEY })
      toast.success('Contenido actualizado.')
    },
    onError: () => toast.error('No se pudo actualizar el contenido.'),
  })
}
