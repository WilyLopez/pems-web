'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { legalService } from '@/services/legal.service'
import { ActualizarContenidoLegalPayload, CrearContenidoLegalPayload } from '@/types/legal.types'

export const LEGAL_KEY = ['legal']

export function useContenidoLegalPublico(tipo: string) {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'publico', tipo],
    queryFn: () => legalService.obtenerPublico(tipo),
    staleTime: 10 * 60_000,
  })
}

export function useContenidoLegalAdmin() {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'admin'],
    queryFn: () => legalService.listarAdmin(),
    staleTime: 30_000,
  })
}

export function useContenidoLegalPorTipo(tipo: string) {
  return useQuery({
    queryKey: [...LEGAL_KEY, tipo],
    queryFn: () => legalService.obtenerPorTipo(tipo),
    staleTime: 30_000,
  })
}

export function useActualizarLegal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      tipo,
      payload,
    }: {
      tipo: string
      payload: ActualizarContenidoLegalPayload
    }) => legalService.actualizar(tipo, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LEGAL_KEY })
      toast.success(`Versión ${data.version} guardada.`)
    },
    onError: () => toast.error('No se pudo guardar el contenido legal.'),
  })
}

export function useCrearContenidoLegal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CrearContenidoLegalPayload) =>
      legalService.crear(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LEGAL_KEY })
      toast.success(`Documento "${data.titulo}" creado.`)
    },
    onError: () => toast.error('No se pudo crear el documento legal.'),
  })
}

export function useToggleLegal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tipo, activo }: { tipo: string; activo: boolean }) =>
      activo ? legalService.activar(tipo) : legalService.desactivar(tipo),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: LEGAL_KEY })
      toast.success(data.activo ? 'Documento activado.' : 'Documento desactivado.')
    },
    onError: () => toast.error('No se pudo cambiar el estado del documento.'),
  })
}

export function useEliminarContenidoLegal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tipo: string) => legalService.eliminar(tipo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LEGAL_KEY })
      toast.success('Documento eliminado.')
    },
    onError: () => toast.error('No se pudo eliminar el documento.'),
  })
}
