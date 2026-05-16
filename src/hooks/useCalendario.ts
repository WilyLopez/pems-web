// hooks/useCalendario.ts

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { calendarioService } from '@/services/calendario.service'
import { TipoBloqueo } from '@/types/calendario.types'
import { DISPONIBILIDAD_RANGO_KEY } from './useDisponibilidad'

export const RESUMEN_DIA_KEY = 'resumen-dia'

// ── Resumen del dia (usado en el drawer) ──────────────────────────────────────

export function useResumenDia(idSede: number, fecha: string | null) {
  return useQuery({
    queryKey: [RESUMEN_DIA_KEY, idSede, fecha],
    queryFn: () => calendarioService.getResumenDia(idSede, fecha!),
    enabled: !!idSede && !!fecha,
    staleTime: 1000 * 30,
  })
}

// ── Bloquear fechas ───────────────────────────────────────────────────────────

interface BloquearPayload {
  idSede: number
  fechaInicio: string
  fechaFin: string
  tipoBloqueo: TipoBloqueo
  motivo: string
}

export function useBloquearFechas() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ idSede, ...payload }: BloquearPayload) =>
      calendarioService.bloquearFechas(idSede, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DISPONIBILIDAD_RANGO_KEY] })
      qc.invalidateQueries({ queryKey: [RESUMEN_DIA_KEY] })
      toast.success('Fechas bloqueadas correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo crear el bloqueo.')
    },
  })
}

// ── Desactivar bloqueo ────────────────────────────────────────────────────────

export function useDesactivarBloqueo() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (idBloque: number) =>
      calendarioService.desactivarBloqueo(idBloque),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DISPONIBILIDAD_RANGO_KEY] })
      toast.success('Bloqueo desactivado.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo desactivar el bloqueo.')
    },
  })
}

// ── Crear feriado ─────────────────────────────────────────────────────────────

interface FeriadoPayload {
  tipoFeriado: string
  fecha: string
  descripcion: string
}

export function useCrearFeriado() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: FeriadoPayload) =>
      calendarioService.crearFeriado(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DISPONIBILIDAD_RANGO_KEY] })
      toast.success('Feriado registrado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo registrar el feriado.')
    },
  })
}

// ── Eliminar feriado ──────────────────────────────────────────────────────────

export function useEliminarFeriado() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (idFeriado: number) =>
      calendarioService.eliminarFeriado(idFeriado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [DISPONIBILIDAD_RANGO_KEY] })
      toast.success('Feriado eliminado.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo eliminar el feriado.')
    },
  })
}
