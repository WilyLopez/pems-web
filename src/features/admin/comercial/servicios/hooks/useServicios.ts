import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'
import {
  ServicioCotizacion,
  ServicioVariante,
  ServicioImagen,
} from '@/types/comercial.types'

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

export function useServicioVariantes(idServicio?: number) {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.servicioVariantes(idServicio),
    queryFn: () =>
      comercialService.serviciosCotizacion.variantes.listar(idServicio!),
    enabled: !!idServicio,
  })
}

export function useServicioVarianteMutations(idServicio?: number) {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({
      queryKey: COMERCIAL_QUERY_KEYS.servicioVariantes(idServicio),
    })
    qc.invalidateQueries({
      queryKey: COMERCIAL_QUERY_KEYS.serviciosCotizacionAdmin(),
    })
  }

  const crear = useMutation({
    mutationFn: (payload: Omit<ServicioVariante, 'id' | 'idServicio'>) =>
      comercialService.serviciosCotizacion.variantes.crear(
        idServicio!,
        payload
      ),
    onSuccess: () => {
      invalidar()
      toast.success('Variante creada')
    },
    onError: () => toast.error('Error al crear la variante'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: Omit<ServicioVariante, 'id' | 'idServicio'>
    }) =>
      comercialService.serviciosCotizacion.variantes.actualizar(
        idServicio!,
        id,
        payload
      ),
    onSuccess: () => {
      invalidar()
      toast.success('Variante actualizada')
    },
    onError: () => toast.error('Error al actualizar la variante'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) =>
      comercialService.serviciosCotizacion.variantes.eliminar(idServicio!, id),
    onSuccess: () => {
      invalidar()
      toast.success('Variante eliminada')
    },
    onError: () => toast.error('Error al eliminar la variante'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.serviciosCotizacion.variantes.reordenar(
        idServicio!,
        id,
        nuevoOrden
      ),
    onSuccess: invalidar,
    onError: () => toast.error('Error al reordenar las variantes'),
  })

  return { crear, actualizar, eliminar, reordenar }
}

export function useServicioImagenes(idServicio?: number) {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.servicioImagenes(idServicio),
    queryFn: () =>
      comercialService.serviciosCotizacion.imagenes.listar(idServicio!),
    enabled: !!idServicio,
  })
}

export function useServicioImagenMutations(idServicio?: number) {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({
      queryKey: COMERCIAL_QUERY_KEYS.servicioImagenes(idServicio),
    })
    qc.invalidateQueries({
      queryKey: COMERCIAL_QUERY_KEYS.serviciosCotizacionAdmin(),
    })
  }

  const subir = useMutation({
    mutationFn: ({
      archivo,
      idVariante,
    }: {
      archivo: File
      idVariante?: number
    }) =>
      comercialService.serviciosCotizacion.imagenes.subir(
        idServicio!,
        archivo,
        {
          idVariante,
        }
      ),
    onSuccess: invalidar,
    onError: () => toast.error('Error al subir la imagen'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) =>
      comercialService.serviciosCotizacion.imagenes.eliminar(idServicio!, id),
    onSuccess: invalidar,
    onError: () => toast.error('Error al eliminar la imagen'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.serviciosCotizacion.imagenes.reordenar(
        idServicio!,
        id,
        nuevoOrden
      ),
    onSuccess: invalidar,
    onError: () => toast.error('Error al reordenar las imágenes'),
  })

  const marcarPrincipal = useMutation({
    mutationFn: (id: number) =>
      comercialService.serviciosCotizacion.imagenes.marcarPrincipal(
        idServicio!,
        id
      ),
    onSuccess: invalidar,
    onError: () => toast.error('Error al marcar la imagen principal'),
  })

  return { subir, eliminar, reordenar, marcarPrincipal }
}
