'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { configuracionApi } from '../services/configuracion.api'
import type {
  ConfiguracionSistema,
  ConfiguracionCalendario,
  ActualizarConfiguracionCalendarioRequest,
  Sede,
} from '../types'

export const CONFIGURACION_KEYS = {
  GLOBAL: 'configuracion',
  CALENDARIO: 'configuracion-calendario',
  SEDE: 'sede',
} as const

export function toConfigMap(
  configs: ConfiguracionSistema[]
): Record<string, string> {
  return Object.fromEntries(configs.map((c) => [c.clave, c.valor]))
}

export function useConfiguracion() {
  return useQuery({
    queryKey: [CONFIGURACION_KEYS.GLOBAL],
    queryFn: configuracionApi.listarGlobal,
  })
}

export function useActualizarConfiguracion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (cambios: Record<string, string>) =>
      configuracionApi.actualizarGlobal(cambios),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente.')
      qc.invalidateQueries({ queryKey: [CONFIGURACION_KEYS.GLOBAL] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo guardar la configuración.'),
  })
}

export function useConfiguracionCalendario(idSede: number | null) {
  return useQuery({
    queryKey: [CONFIGURACION_KEYS.CALENDARIO, idSede],
    queryFn: () => configuracionApi.obtenerCalendario(idSede!),
    enabled: !!idSede,
  })
}

export function useActualizarConfiguracionCalendario(idSede: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ActualizarConfiguracionCalendarioRequest) =>
      configuracionApi.actualizarCalendario(idSede, payload),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente.')
      qc.invalidateQueries({
        queryKey: [CONFIGURACION_KEYS.CALENDARIO, idSede],
      })
      qc.invalidateQueries({ queryKey: ['disponibilidad-rango'] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo guardar la configuración.'),
  })
}

export function useSede(idSede: number | null) {
  return useQuery({
    queryKey: [CONFIGURACION_KEYS.SEDE, idSede],
    queryFn: () => configuracionApi.obtenerSede(idSede!),
    enabled: !!idSede,
  })
}

export function useActualizarSede(idSede: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: Partial<Sede>) =>
      configuracionApi.actualizarSede(idSede, values),
    onSuccess: () => {
      toast.success('Datos de la sede actualizados.')
      qc.invalidateQueries({ queryKey: [CONFIGURACION_KEYS.SEDE, idSede] })
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar la sede.'),
  })
}

export function useConfiguracionVenta(idSede: number | null) {
  const { data } = useConfiguracionCalendario(idSede)
  return {
    edadMin: data?.edadMinCumple ?? 0,
    edadMax: data?.edadMaxCumple ?? 17,
  }
}

export function useEdadMaxNino(idSede: number | null): number {
  const { edadMax } = useConfiguracionVenta(idSede)
  return edadMax
}
