import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contratosApi, ListarContratosParams } from '../services/contratos.api'
import {
  ActualizarContratoPayload,
  CambiarEstadoPayload,
  GenerarContratoPayload,
} from '../types'
import { contratosKeys } from '../shared/queryKeys'

export function useContratos(params: ListarContratosParams = {}) {
  return useQuery({
    queryKey: contratosKeys.list(params),
    queryFn: () => contratosApi.listar(params),
    staleTime: 30_000,
  })
}

export function useContrato(id: number) {
  return useQuery({
    queryKey: contratosKeys.detail(id),
    queryFn: () => contratosApi.obtener(id),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useContratoPorEvento(idEvento: number | null) {
  return useQuery({
    queryKey: contratosKeys.porEvento(idEvento!),
    queryFn: () => contratosApi.obtenerPorEvento(idEvento!),
    enabled: !!idEvento,
    staleTime: 30_000,
    retry: false,
  })
}

export function useGenerarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      payload,
    }: {
      idEvento: number
      payload?: GenerarContratoPayload
    }) => contratosApi.generar(idEvento, payload),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.invalidateQueries({
        queryKey: contratosKeys.porEvento(contrato.idEventoPrivado),
      })
      toast.success('Contrato generado correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo generar el contrato.'),
  })
}

export function useActualizarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarContratoPayload
    }) => contratosApi.actualizar(id, payload),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.setQueryData(contratosKeys.detail(contrato.id), contrato)
      toast.success(`Contrato actualizado. Versión ${contrato.version}.`)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar el contrato.'),
  })
}

export function useFirmarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contratosApi.firmar(id),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.setQueryData(contratosKeys.detail(contrato.id), contrato)
      toast.success('Contrato firmado y PDF generado.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo firmar el contrato.'),
  })
}

export function useCambiarEstadoContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: CambiarEstadoPayload
    }) => contratosApi.cambiarEstado(id, payload),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.setQueryData(contratosKeys.detail(contrato.id), contrato)
      toast.success(`Estado actualizado a ${contrato.estado}.`)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar el estado.'),
  })
}

export function useReemplazarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contratosApi.reemplazar(id),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.invalidateQueries({
        queryKey: contratosKeys.porEvento(contrato.idEventoPrivado),
      })
      qc.setQueryData(contratosKeys.detail(contrato.id), contrato)
      toast.success('Contrato reemplazado. El anterior quedó archivado.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo reemplazar el contrato.'),
  })
}

export function useSubirDocumento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, archivo }: { id: number; archivo: File }) =>
      contratosApi.subirDocumento(id, archivo),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: contratosKeys.detail(id) })
      toast.success('Documento subido correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo subir el documento.'),
  })
}
