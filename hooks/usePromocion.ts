'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { promocionService, CrearPromocionPayload } from '@/services/promocion.service'
import { toast } from 'sonner'

export const PROMOCIONES_KEY = 'promociones'

export function usePromociones() {
  return useQuery({
    queryKey: [PROMOCIONES_KEY],
    queryFn: () => promocionService.listar(),
  })
}

export function useCrearPromocion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearPromocionPayload) => promocionService.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOCIONES_KEY] })
      toast.success('Promoción creada correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo crear la promoción.')
    },
  })
}

export function useDesactivarPromocion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => promocionService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOCIONES_KEY] })
      toast.success('Promoción desactivada.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo desactivar la promoción.')
    },
  })
}