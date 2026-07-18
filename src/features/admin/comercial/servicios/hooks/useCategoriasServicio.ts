import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'
import {
  CategoriaServicio,
  CrearCategoriaServicioPayload,
  ActualizarCategoriaServicioPayload,
} from '@/types/comercial.types'

export function useCategoriasServicioAdmin() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.categoriasServicioAdmin(),
    queryFn: comercialService.categoriasServicio.listarAdmin,
  })
}

export function useCategoriasServicioPublico() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.categoriasServicioPublico(),
    queryFn: comercialService.categoriasServicio.listarActivas,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategoriaServicioMutations() {
  const qc = useQueryClient()
  const invalidar = () =>
    qc.invalidateQueries({ queryKey: ['categorias-servicio'] })

  const crear = useMutation({
    mutationFn: (payload: CrearCategoriaServicioPayload) =>
      comercialService.categoriasServicio.crear(payload),
    onSuccess: () => {
      invalidar()
      toast.success('Categoría creada')
    },
    onError: () => toast.error('Error al crear la categoría'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: ActualizarCategoriaServicioPayload
    }) => comercialService.categoriasServicio.actualizar(id, payload),
    onSuccess: () => {
      invalidar()
      toast.success('Categoría actualizada')
    },
    onError: () => toast.error('Error al actualizar la categoría'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) =>
      comercialService.categoriasServicio.eliminar(id),
    onSuccess: () => {
      invalidar()
      toast.success('Categoría eliminada')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      toast.error(msg ?? 'Error al eliminar la categoría')
    },
  })

  const toggleActivo = useMutation({
    mutationFn: (c: CategoriaServicio) =>
      comercialService.categoriasServicio.actualizar(c.id, {
        nombre: c.nombre,
        activo: !c.activo,
        orden: c.orden,
      }),
    onSuccess: () => {
      invalidar()
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, toggleActivo }
}
