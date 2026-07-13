import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ventasApi, CobrarReservaPayload } from '../services/ventas.api'
import {
  RegistrarVentaMostradorPayload,
  VentaFiltros,
  VentaMostradorResponse,
} from '../types'
import { RESERVAS_KEYS } from '@/features/admin/reservas/hooks/useReservasData'
import { ApiError } from '@/types/api.types'
import { toast } from 'sonner'

export const VENTAS_KEYS = {
  LIST: 'admin:ventas:list',
  DETAIL: 'admin:ventas:detail',
  PRECIO_DIA: 'admin:ventas:precio-dia',
}

export function useCobrarReserva() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      reservaId,
      payload,
    }: {
      reservaId: number
      payload: CobrarReservaPayload
    }) => ventasApi.cobrarReserva(reservaId, payload),
    onSuccess: () => {
      toast.success('Reserva cobrada correctamente')
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? 'No se pudo procesar el pago')
    },
  })
}

export function usePrecioDia(idSede: number | null, fecha: string) {
  return useQuery({
    queryKey: [VENTAS_KEYS.PRECIO_DIA, idSede, fecha],
    queryFn: () => ventasApi.precioDia(idSede!, fecha),
    enabled: !!idSede && !!fecha,
    staleTime: 5 * 60 * 1000,
  })
}

export function useRegistrarVentaMostrador() {
  const qc = useQueryClient()
  return useMutation<
    VentaMostradorResponse,
    ApiError,
    RegistrarVentaMostradorPayload
  >({
    mutationFn: (payload) => ventasApi.registrarMostrador(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.ADMIN_LIST] })
      qc.invalidateQueries({ queryKey: [RESERVAS_KEYS.METRICS] })
    },
    onError: (err) => {
      toast.error(err.message ?? 'No se pudo registrar la venta')
    },
  })
}

export function useVentas(filtros: VentaFiltros) {
  return useQuery({
    queryKey: [VENTAS_KEYS.LIST, filtros],
    queryFn: () => ventasApi.listar(filtros),
    enabled: !!filtros.idSede,
  })
}

export function useEnviarCorreoVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ idVenta, correo }: { idVenta: number; correo?: string }) =>
      ventasApi.enviarCorreo(idVenta, correo),
    onSuccess: (_, variables) => {
      toast.success('Correo enviado correctamente')
      qc.invalidateQueries({
        queryKey: [VENTAS_KEYS.DETAIL, variables.idVenta],
      })
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.LIST] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.mensaje ?? 'No se pudo enviar el correo')
    },
  })
}

export function useMarcarImpreso() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idVenta: number) => ventasApi.marcarImpreso(idVenta),
    onSuccess: (_, idVenta) => {
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.DETAIL, idVenta] })
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.LIST] })
    },
  })
}

export function useMarcarDescargado() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (idVenta: number) => ventasApi.marcarDescargado(idVenta),
    onSuccess: (_, idVenta) => {
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.DETAIL, idVenta] })
      qc.invalidateQueries({ queryKey: [VENTAS_KEYS.LIST] })
    },
  })
}
