'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import { ZonaJuego, CrearZonaPayload, ActualizarZonaPayload } from '@/types/comercial.types'

export function useZonasAdmin() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.zonasAdmin(),
    queryFn: comercialService.zonas.listarAdmin,
    staleTime: 1000 * 60 * 2,
    select: (data) => [...data].sort((a, b) => a.orden - b.orden),
  })
}

export function useZona(id: number | null) {
  const { data: zonas } = useZonasAdmin()
  return id !== null ? (zonas?.find((z) => z.id === id) ?? null) : null
}

export function useZonasPublico() {
  return useQuery({
    queryKey: ['zonas', 'publico'],
    queryFn: comercialService.zonas.listarActivas,
    staleTime: 1000 * 60 * 5,
  })
}

export function useZonaMutations() {
  const qc = useQueryClient()
  const key = CMS_QUERY_KEYS.zonasAdmin()

  const invalidar = () => qc.invalidateQueries({ queryKey: key })

  const crear = useMutation({
    mutationFn: (payload: CrearZonaPayload) => comercialService.zonas.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Zona creada') },
    onError: () => toast.error('Error al crear la zona'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarZonaPayload }) =>
      comercialService.zonas.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Zona actualizada') },
    onError: () => toast.error('Error al actualizar la zona'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.zonas.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Zona eliminada') },
    onError: () => toast.error('Error al eliminar la zona'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.zonas.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActivo = useMutation({
    mutationFn: (z: ZonaJuego) =>
      comercialService.zonas.actualizar(z.id, {
        nombre: z.nombre,
        descripcion: z.descripcion,
        edadMinima: z.edadMinima,
        edadMaxima: z.edadMaxima,
        imagenes: z.imagenes,
        videos: z.videos,
        activa: !z.activa,
        destacada: z.destacada,
        orden: z.orden,
      }),
    onMutate: async (z) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ZonaJuego[]>(key)
      qc.setQueryData<ZonaJuego[]>(key, (old = []) =>
        old.map((item) => (item.id === z.id ? { ...item, activa: !item.activa } : item))
      )
      return { prev }
    },
    onError: (_err, _z, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
      toast.error('No se pudo cambiar el estado')
    },
    onSettled: () => invalidar(),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
}
