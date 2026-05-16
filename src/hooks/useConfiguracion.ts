'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import { ConfiguracionSistema, Sede } from '@/types/configuracion.types'

export function useConfiguracion() {
  return useQuery({
    queryKey: ['configuracion'],
    queryFn: async () => {
      const { data } =
        await api.get<ApiResponse<ConfiguracionSistema[]>>('/configuracion')
      return data.data
    },
  })
}

export function useActualizarConfiguracion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cambios: Record<string, string>) =>
      api.put<ApiResponse<ConfiguracionSistema[]>>('/configuracion', cambios),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente.')
      qc.invalidateQueries({ queryKey: ['configuracion'] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo guardar la configuración.'),
  })
}

export function useSede(idSede: number | null) {
  return useQuery({
    queryKey: ['sede', idSede],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Sede>>(`/sedes/${idSede}`)
      return data.data
    },
    enabled: !!idSede,
  })
}

export function useActualizarSede(idSede: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: Partial<Sede>) =>
      api.put<ApiResponse<Sede>>(`/sedes/${idSede}`, values),
    onSuccess: () => {
      toast.success('Datos de la sede actualizados.')
      qc.invalidateQueries({ queryKey: ['sede', idSede] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar la sede.'),
  })
}
