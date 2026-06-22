'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  promocionService,
  CrearPromocionPayload,
  ActualizarPromocionPayload,
} from '@/services/promocion.service'
import { toast } from 'sonner'

export const PROMOCIONES_KEY = 'promociones'
export const ESTADISTICAS_PROMO_KEY = 'promociones-estadisticas'

export function usePromociones() {
  return useQuery({
    queryKey: [PROMOCIONES_KEY],
    queryFn: () => promocionService.listar(),
  })
}

export function useEstadisticasPromocion() {
  return useQuery({
    queryKey: [ESTADISTICAS_PROMO_KEY],
    queryFn: () => promocionService.estadisticas(),
  })
}

export function useCrearPromocion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearPromocionPayload) =>
      promocionService.crear(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOCIONES_KEY] })
      queryClient.invalidateQueries({ queryKey: [ESTADISTICAS_PROMO_KEY] })
      toast.success('Promoción creada correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo crear la promoción.')
    },
  })
}

export function useActualizarPromocion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarPromocionPayload
    }) => promocionService.actualizar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOCIONES_KEY] })
      toast.success('Promoción actualizada.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo actualizar la promoción.')
    },
  })
}

export function useDesactivarPromocion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => promocionService.desactivar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMOCIONES_KEY] })
      queryClient.invalidateQueries({ queryKey: [ESTADISTICAS_PROMO_KEY] })
      toast.success('Promoción desactivada.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo desactivar la promoción.')
    },
  })
}
