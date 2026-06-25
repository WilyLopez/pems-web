import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calendarApi } from '../services/calendar.api'
import { ConfiguracionCalendario, TipoBloqueo } from '../types'

export const CALENDAR_KEYS = {
  DISPONIBILIDAD: 'disponibilidad',
  RANGO: 'disponibilidad-rango',
  RESUMEN: 'resumen-dia',
  CONFIG: 'configuracion-calendario',
  CONFIG_PUBLICA: 'configuracion-calendario-publica',
  PROGRAMACIONES: 'programaciones-semanal',
} as const

export function useResumenDia(idSede: number, fecha: string | null) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.RESUMEN, idSede, fecha],
    queryFn: () => calendarApi.getResumenDia(idSede, fecha!),
    enabled: !!idSede && !!fecha,
    staleTime: 1000 * 30,
  })
}

export function useDisponibilidad(idSede: number, fecha: string | null) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.DISPONIBILIDAD, idSede, fecha],
    queryFn: () => calendarApi.getDisponibilidad(idSede, fecha!),
    enabled: !!idSede && !!fecha,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDisponibilidadRango(idSede: number, inicio: string, fin: string) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.RANGO, idSede, inicio, fin],
    queryFn: ({ signal }) => calendarApi.getDisponibilidadRango(idSede, inicio, fin, signal),
    enabled: !!idSede && !!inicio && !!fin,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function useBloquearFechas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ idSede, confirmado, ...payload }: { idSede: number; fechaInicio: string; fechaFin: string; motivo: string; tipoBloqueo: TipoBloqueo; confirmado?: boolean }) =>
      calendarApi.bloquearFechas(idSede, payload, confirmado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RESUMEN] })
      toast.success('Accion realizada correctamente.')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.mensaje ?? err.message ?? 'No se pudo completar la accion.')
    },
  })
}

export function useDesactivarBloqueo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idBloque: number) => calendarApi.desactivarBloqueo(idBloque),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RESUMEN] })
      toast.success('Bloqueo desactivado.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo desactivar el bloqueo.')
    },
  })
}

export function useCrearFeriado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { tipoFeriado: string; fecha: string; descripcion: string }) =>
      calendarApi.crearFeriado(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      toast.success('Feriado registrado correctamente.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo registrar el feriado.')
    },
  })
}

export function useConfiguracionCalendario(idSede: number) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.CONFIG, idSede],
    queryFn: () => calendarApi.getConfiguracion(idSede),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 10,
  })
}

export function useConfiguracionCalendarioPublica(idSede: number) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.CONFIG_PUBLICA, idSede],
    queryFn: () => calendarApi.getConfiguracionPublica(idSede),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 10,
  })
}

export function useActualizarConfiguracion(idSede: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<ConfiguracionCalendario, 'idSede'>) =>
      calendarApi.actualizarConfiguracion(idSede, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.CONFIG, idSede] })
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      toast.success('Configuracion actualizada.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo guardar la configuracion.')
    },
  })
}

export function useEliminarFeriado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idFeriado: number) => calendarApi.eliminarFeriado(idFeriado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      toast.success('Feriado eliminado.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo eliminar el feriado.')
    },
  })
}

export function useProgramaciones(idSede: number) {
  return useQuery({
    queryKey: [CALENDAR_KEYS.PROGRAMACIONES, idSede],
    queryFn: () => calendarApi.listarProgramaciones(idSede),
    enabled: !!idSede,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCrearProgramacion(idSede: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { semanaInicio: string; semanaFin: string }) =>
      calendarApi.crearProgramacion(idSede, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.PROGRAMACIONES, idSede] })
      toast.success('Programacion semanal creada.')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? err.message ?? 'No se pudo crear la programacion.')
    },
  })
}

export function useCancelarProgramacion(idSede: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => calendarApi.cancelarProgramacion(idSede, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.RANGO] })
      qc.invalidateQueries({ queryKey: [CALENDAR_KEYS.PROGRAMACIONES, idSede] })
      toast.success('Programacion cancelada.')
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'No se pudo cancelar la programacion.')
    },
  })
}
