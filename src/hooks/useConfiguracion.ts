'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { ApiResponse } from '@/types/api.types'
import {
  ConfiguracionSistema,
  ConfiguracionCalendario,
  ActualizarConfiguracionCalendarioRequest,
  Sede,
} from '@/types/configuracion.types'

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

export function useConfiguracionCalendario(idSede: number | null) {
  return useQuery({
    queryKey: ['configuracion-calendario', idSede],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ConfiguracionCalendario>>(
        `/calendario/configuracion/sedes/${idSede}`
      )
      return data.data
    },
    enabled: !!idSede,
  })
}

export function useActualizarConfiguracionCalendario(idSede: number | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActualizarConfiguracionCalendarioRequest) =>
      api
        .put<
          ApiResponse<ConfiguracionCalendario>
        >(`/calendario/configuracion/sedes/${idSede}`, payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente.')
      qc.invalidateQueries({ queryKey: ['configuracion-calendario', idSede] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo guardar la configuración.'),
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

const EDAD_MAX_NINO_KEY = 'EDAD_MAX_NINO'
const EDAD_MAX_NINO_DEFAULT = 12
const EDAD_MIN_NINO_KEY = 'EDAD_MIN_NINO'
const EDAD_MIN_NINO_DEFAULT = 1

export function useConfiguracionVenta() {
  const { data } = useConfiguracion()

  const edadMaxRaw = data?.find((c) => c.clave === EDAD_MAX_NINO_KEY)?.valor
  const edadMaxParsed =
    edadMaxRaw !== undefined ? parseInt(edadMaxRaw, 10) : NaN
  const edadMax = Number.isNaN(edadMaxParsed)
    ? EDAD_MAX_NINO_DEFAULT
    : edadMaxParsed

  const edadMinRaw = data?.find((c) => c.clave === EDAD_MIN_NINO_KEY)?.valor
  const edadMinParsed =
    edadMinRaw !== undefined ? parseInt(edadMinRaw, 10) : NaN
  const edadMin = Number.isNaN(edadMinParsed)
    ? EDAD_MIN_NINO_DEFAULT
    : edadMinParsed

  return { edadMin, edadMax }
}

export function useEdadMaxNino(): number {
  const { edadMax } = useConfiguracionVenta()
  return edadMax
}
