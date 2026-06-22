'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bannerService } from '@/services/banner.service'
import {
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/types/banner.types'

export const BANNERS_KEY = ['banners']

export function useBanners(page = 0, size = 20) {
  return useQuery({
    queryKey: [...BANNERS_KEY, page, size],
    queryFn: () => bannerService.listar(page, size),
    staleTime: 30_000,
  })
}

export function useBannersPublicos(idSede?: number) {
  return useQuery({
    queryKey: [...BANNERS_KEY, 'publico', idSede],
    queryFn: () => bannerService.obtenerPublicos(idSede),
    staleTime: 60_000,
  })
}

export function useCrearBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearBannerPayload) => bannerService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY })
      toast.success('Banner creado.')
    },
    onError: () => toast.error('No se pudo crear el banner.'),
  })
}

export function useActualizarBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarBannerPayload
    }) => bannerService.actualizar(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY })
      toast.success('Banner actualizado.')
    },
    onError: () => toast.error('No se pudo actualizar el banner.'),
  })
}

export function useToggleBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      activo ? bannerService.desactivar(id) : bannerService.activar(id),
    onSuccess: (_, { activo }) => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY })
      toast.success(activo ? 'Banner desactivado.' : 'Banner activado.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
  })
}

export function useDuplicarBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bannerService.duplicar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY })
      toast.success('Banner duplicado como borrador.')
    },
    onError: () => toast.error('No se pudo duplicar el banner.'),
  })
}

export function useEliminarBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bannerService.eliminar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BANNERS_KEY })
      toast.success('Banner eliminado.')
    },
    onError: () => toast.error('No se pudo eliminar el banner.'),
  })
}

export function useReordenarBanners() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => bannerService.reordenar(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: BANNERS_KEY }),
    onError: () => toast.error('No se pudo reordenar.'),
  })
}
