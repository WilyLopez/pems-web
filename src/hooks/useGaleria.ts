'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { galeriaService } from '@/services/galeria.service'
import { ActualizarImagenGaleriaPayload } from '@/types/galeria.types'

export const GALERIA_KEY = ['galeria']

export function useGaleria(page = 0, size = 20, soloDestacadas = false) {
  return useQuery({
    queryKey: [...GALERIA_KEY, page, size, soloDestacadas],
    queryFn: () => galeriaService.listar(page, size, soloDestacadas),
    staleTime: 30_000,
  })
}

export function useSubirImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      archivo,
      titulo,
      descripcion,
    }: {
      archivo: File
      titulo?: string
      descripcion?: string
    }) => galeriaService.subir(archivo, titulo, descripcion),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GALERIA_KEY })
      toast.success('Imagen subida.')
    },
    onError: () => toast.error('No se pudo subir la imagen.'),
  })
}

export function useActualizarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarImagenGaleriaPayload
    }) => galeriaService.actualizar(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GALERIA_KEY })
      toast.success('Imagen actualizada.')
    },
    onError: () => toast.error('No se pudo actualizar la imagen.'),
  })
}

export function useDestacarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, destacada }: { id: number; destacada: boolean }) =>
      destacada
        ? galeriaService.quitarDestacado(id)
        : galeriaService.destacar(id),
    onSuccess: (_, { destacada }) => {
      qc.invalidateQueries({ queryKey: GALERIA_KEY })
      toast.success(destacada ? 'Destacado removido.' : 'Imagen destacada.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useEliminarImagen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => galeriaService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: GALERIA_KEY })
      toast.success('Imagen eliminada.')
    },
    onError: () => toast.error('No se pudo eliminar la imagen.'),
  })
}
