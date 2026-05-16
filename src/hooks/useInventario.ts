'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventarioService } from '@/services/inventario.service'
import { MovimientoInventarioPayload } from '@/types/inventario.types'
import { toast } from 'sonner'

export const INVENTARIO_KEY = 'inventario'

export function useAlertasStock(idSede: number) {
  return useQuery({
    queryKey: [INVENTARIO_KEY, 'alertas', idSede],
    queryFn: () => inventarioService.getAlertasStock(idSede),
    enabled: !!idSede,
  })
}

export function useMovimientoInventario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      idProducto,
      tipo,
      payload,
    }: {
      idProducto: number
      tipo: 'entrada' | 'salida' | 'ajuste'
      payload: MovimientoInventarioPayload
    }) => inventarioService.registrarMovimiento(idProducto, tipo, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTARIO_KEY] })
      toast.success('Movimiento registrado correctamente.')
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'No se pudo registrar el movimiento.')
    },
  })
}
