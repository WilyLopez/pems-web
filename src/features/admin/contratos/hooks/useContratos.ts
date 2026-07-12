import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contratosApi, ListarContratosParams } from '../services/contratos.api'
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

export function useCargarContrato() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      idEvento,
      archivo,
    }: {
      idEvento: number
      archivo: File
    }) => contratosApi.cargar(idEvento, archivo),
    onSuccess: (contrato) => {
      qc.invalidateQueries({ queryKey: contratosKeys.lists() })
      qc.invalidateQueries({
        queryKey: contratosKeys.porEvento(contrato.idEventoPrivado),
      })
      qc.setQueryData(contratosKeys.detail(contrato.id), contrato)
      toast.success('Contrato cargado correctamente.')
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message ?? 'No se pudo cargar el contrato.'),
  })
}
