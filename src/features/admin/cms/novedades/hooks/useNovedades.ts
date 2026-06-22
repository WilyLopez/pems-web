'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import { NovedadLocal, CrearNovedadPayload, ActualizarNovedadPayload } from '@/types/comercial.types'

export function useNovedadesAdmin() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.novedadesAdmin(),
    queryFn: comercialService.novedades.listarAdmin,
  })
}

export function useNovedadesPublico() {
  return useQuery({
    queryKey: ['novedades', 'home'],
    queryFn: comercialService.novedades.listarHome,
    staleTime: 1000 * 60 * 5,
  })
}

export function useNovedadMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['novedades'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearNovedadPayload) => comercialService.novedades.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Novedad creada') },
    onError: () => toast.error('Error al crear la novedad'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarNovedadPayload }) =>
      comercialService.novedades.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Novedad actualizada') },
    onError: () => toast.error('Error al actualizar la novedad'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.novedades.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Novedad eliminada') },
    onError: () => toast.error('Error al eliminar la novedad'),
  })

  const toggleActivo = useMutation({
    mutationFn: (n: NovedadLocal) =>
      comercialService.novedades.actualizar(n.id, {
        titulo: n.titulo, descripcion: n.descripcion,
        imagenUrl: n.imagenUrl, textoCta: n.textoCta,
        urlCta: n.urlCta, prioridad: n.prioridad,
        fechaInicio: n.fechaInicio, fechaFin: n.fechaFin,
        visibleHome: n.visibleHome, destacada: n.destacada,
        activa: !n.activa,
      }),
    onMutate: async (n) => {
      const queryKey = CMS_QUERY_KEYS.novedadesAdmin()
      await qc.cancelQueries({ queryKey })
      const previousData = qc.getQueryData<NovedadLocal[]>(queryKey)
      if (previousData) {
        qc.setQueryData<NovedadLocal[]>(
          queryKey,
          previousData.map((nov) =>
            nov.id === n.id ? { ...nov, activa: !n.activa } : nov
          )
        )
      }
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        qc.setQueryData(CMS_QUERY_KEYS.novedadesAdmin(), context.previousData)
      }
      toast.error('No se pudo cambiar el estado')
    },
    onSuccess: (_, n) => {
      toast.success(n.activa ? 'Novedad desactivada' : 'Novedad activada')
    },
    onSettled: () => {
      invalidar()
    },
  })

  return { crear, actualizar, eliminar, toggleActivo }
}
