'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { CMS_QUERY_KEYS } from '@/features/admin/cms/shared/queryKeys'
import {
  ActividadLocal,
  CrearActividadPayload,
  ActualizarActividadPayload,
} from '@/types/comercial.types'

export function useActividadesAdmin() {
  return useQuery({
    queryKey: CMS_QUERY_KEYS.actividadesAdmin(),
    queryFn: comercialService.actividades.listarAdmin,
  })
}

export function useActividadesPublico() {
  return useQuery({
    queryKey: ['actividades', 'publico'],
    queryFn: comercialService.actividades.listarActivas,
    staleTime: 1000 * 60 * 5,
  })
}

export function useActividadMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['actividades'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearActividadPayload) =>
      comercialService.actividades.crear(payload),
    onSuccess: () => {
      invalidar()
      toast.success('Actividad creada')
    },
    onError: () => toast.error('Error al crear la actividad'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarActividadPayload
    }) => comercialService.actividades.actualizar(id, payload),
    onSuccess: () => {
      invalidar()
      toast.success('Actividad actualizada')
    },
    onError: () => toast.error('Error al actualizar la actividad'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.actividades.eliminar(id),
    onSuccess: () => {
      invalidar()
      toast.success('Actividad eliminada')
    },
    onError: () => toast.error('Error al eliminar la actividad'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.actividades.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActivo = useMutation({
    mutationFn: (a: ActividadLocal) =>
      comercialService.actividades.actualizar(a.id, {
        nombre: a.nombre,
        descripcion: a.descripcion,
        imagenUrl: a.imagenUrl,
        idZona: a.idZona,
        esEspecial: a.esEspecial,
        fechaInicio: a.fechaInicio,
        fechaFin: a.fechaFin,
        activa: !a.activa,
        destacada: a.destacada,
        orden: a.orden,
      }),
    onSuccess: () => {
      invalidar()
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
}
