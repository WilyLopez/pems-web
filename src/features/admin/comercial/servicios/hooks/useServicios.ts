import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'
import { ServicioCotizacion } from '@/types/comercial.types'

export function useServiciosCotizacionAdmin() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.serviciosCotizacionAdmin(),
    queryFn: comercialService.serviciosCotizacion.listarAdmin,
  })
}

export function useServicioCotizacionMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['servicios-cotizacion'] })
  }

  const crear = useMutation({
    mutationFn: (payload: Partial<ServicioCotizacion>) =>
      comercialService.serviciosCotizacion.crear(payload),
    onSuccess: () => {
      invalidar()
      toast.success('Servicio creado')
    },
    onError: () => toast.error('Error al crear el servicio'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Partial<ServicioCotizacion>
    }) => comercialService.serviciosCotizacion.actualizar(id, payload),
    onSuccess: () => {
      invalidar()
      toast.success('Servicio actualizado')
    },
    onError: () => toast.error('Error al actualizar el servicio'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) =>
      comercialService.serviciosCotizacion.eliminar(id),
    onSuccess: () => {
      invalidar()
      toast.success('Servicio eliminado')
    },
    onError: () => toast.error('Error al eliminar el servicio'),
  })

  return { crear, actualizar, eliminar }
}
