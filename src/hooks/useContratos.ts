import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  contratoService,
  GenerarContratoPayload,
  ActualizarContratoPayload,
  CambiarEstadoPayload,
} from '@/services/contrato.service'

export const CONTRATOS_KEY = 'contratos'
export const CONTRATO_KEY = 'contrato'

export function useContratos(
  params: {
    page?: number
    size?: number
    search?: string
    estado?: string
    idSede?: number
  } = {}
) {
  return useQuery({
    queryKey: [CONTRATOS_KEY, params],
    queryFn: () => contratoService.listar(params),
  })
}

export function useContrato(id: number) {
  return useQuery({
    queryKey: [CONTRATO_KEY, id],
    queryFn: () => contratoService.obtener(id),
    enabled: !!id,
  })
}

export function useContratoPorEvento(idEvento: number | null) {
  return useQuery({
    queryKey: [CONTRATO_KEY, 'evento', idEvento],
    queryFn: () => contratoService.obtenerPorEvento(idEvento!),
    enabled: !!idEvento,
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
      payload: GenerarContratoPayload
    }) => contratoService.generar(idEvento, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CONTRATOS_KEY] })
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
    }) => contratoService.actualizar(id, payload),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: [CONTRATOS_KEY] })
      qc.setQueryData([CONTRATO_KEY, contrato.id], contrato)
      toast.success('Contrato actualizado. Version ' + contrato.version)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo actualizar el contrato.'),
  })
}

export function useFirmarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contratoService.firmar(id),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: [CONTRATOS_KEY] })
      qc.setQueryData([CONTRATO_KEY, contrato.id], contrato)
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
    }) => contratoService.cambiarEstado(id, payload),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: [CONTRATOS_KEY] })
      qc.setQueryData([CONTRATO_KEY, contrato.id], contrato)
      toast.success('Estado actualizado a ' + contrato.estado)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cambiar el estado.'),
  })
}
