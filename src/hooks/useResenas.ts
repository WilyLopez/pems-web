'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { resenaService } from '@/services/resena.service'
import { ResponderResenaPayload } from '@/types/resena.types'

export const RESENAS_KEY = ['resenas']

export function useResenas(pendientes = false, page = 0, size = 20) {
  return useQuery({
    queryKey: [
      ...RESENAS_KEY,
      pendientes ? 'pendientes' : 'aprobadas',
      page,
      size,
    ],
    queryFn: () => resenaService.listar(pendientes, page, size),
    staleTime: 30_000,
  })
}

export function useAprobarResena() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resenaService.aprobar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESENAS_KEY })
      toast.success('Reseña aprobada y publicada.')
    },
    onError: () => toast.error('No se pudo aprobar la reseña.'),
  })
}

export function useRechazarResena() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resenaService.rechazar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESENAS_KEY })
      toast.success('Reseña eliminada.')
    },
    onError: () => toast.error('No se pudo rechazar la reseña.'),
  })
}

export function useResponderResena() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ResponderResenaPayload
    }) => resenaService.responder(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESENAS_KEY })
      toast.success('Respuesta guardada.')
    },
    onError: () => toast.error('No se pudo guardar la respuesta.'),
  })
}

export function useDestacarResena() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, destacada }: { id: number; destacada: boolean }) =>
      destacada
        ? resenaService.quitarDestacado(id)
        : resenaService.destacar(id),
    onSuccess: (_, { destacada }) => {
      qc.invalidateQueries({ queryKey: RESENAS_KEY })
      toast.success(destacada ? 'Destacado removido.' : 'Reseña destacada.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useToggleHome() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mostrar }: { id: number; mostrar: boolean }) =>
      resenaService.toggleHome(id, mostrar),
    onSuccess: (_, { mostrar }) => {
      qc.invalidateQueries({ queryKey: RESENAS_KEY })
      toast.success(
        mostrar ? 'Reseña añadida al inicio.' : 'Reseña quitada del inicio.'
      )
    },
    onError: () => toast.error('No se pudo cambiar la visibilidad.'),
  })
}
