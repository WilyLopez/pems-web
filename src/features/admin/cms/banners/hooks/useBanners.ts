'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bannerService } from '@/services/banner.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import {
  Banner,
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/types/banner.types'
import { PagedResponse } from '@/types/api.types'

export function useBanners(page = 0, size = 20) {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.banners(page, size),
    queryFn: () => bannerService.listar(page, size),
    staleTime: 30_000,
  })
}

export function useBannersPublicos(idSede?: number) {
  return useQuery({
    queryKey: ['banners', 'publico', idSede],
    queryFn: () => bannerService.obtenerPublicos(idSede),
    staleTime: 60_000,
  })
}

export function useCrearBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearBannerPayload) => bannerService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
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
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success('Banner actualizado.')
    },
    onError: () => toast.error('No se pudo actualizar el banner.'),
  })
}

export function useToggleBanner(page = 0, size = 20) {
  const qc = useQueryClient()
  const queryKey = CMS_QUERY_KEYS.banners(page, size)
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      activo ? bannerService.desactivar(id) : bannerService.activar(id),
    onMutate: async ({ id, activo }) => {
      await qc.cancelQueries({ queryKey })
      const previousData = qc.getQueryData<PagedResponse<Banner>>(queryKey)
      if (previousData) {
        qc.setQueryData<PagedResponse<Banner>>(queryKey, {
          ...previousData,
          content: previousData.content.map((banner) =>
            banner.id === id ? { ...banner, activo: !activo } : banner
          ),
        })
      }
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(queryKey, context.previousData)
      }
      toast.error('No se pudo cambiar el estado.')
    },
    onSuccess: (_, { activo }) => {
      toast.success(activo ? 'Banner desactivado.' : 'Banner activado.')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
    },
  })
}

export function useDuplicarBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bannerService.duplicar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
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
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success('Banner eliminado.')
    },
    onError: () => toast.error('No se pudo eliminar el banner.'),
  })
}

export function useReordenarBanners() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => bannerService.reordenar(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
    onError: () => toast.error('No se pudo reordenar.'),
  })
}
