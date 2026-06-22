import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'
import { TipoEvento } from '@/types/comercial.types'

const STALE_5M = 1000 * 60 * 5

export function useTiposEventoAdmin() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.tiposEventoAdmin(),
    queryFn: comercialService.tiposEvento.listarAdmin,
  })
}

export function useTiposEventoPublico() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.tiposEventoPublico(),
    queryFn: comercialService.tiposEvento.listarActivos,
    staleTime: STALE_5M,
  })
}

export function useTipoEventoMutations() {
  const qc = useQueryClient()
  const invalidar = () => qc.invalidateQueries({ queryKey: ['tipos-evento'] })

  const crear = useMutation({
    mutationFn: (payload: {
      nombre: string
      descripcion?: string
      icono?: string
      orden: number
      activo: boolean
    }) => comercialService.tiposEvento.crear(payload),
    onSuccess: () => {
      invalidar()
      toast.success('Tipo de evento creado')
    },
    onError: () => toast.error('Error al crear el tipo de evento'),
  })

  const actualizar = useMutation({
    mutationFn: ({
      codigo,
      payload,
    }: {
      codigo: string
      payload: {
        nombre: string
        descripcion?: string
        icono?: string
        orden: number
        activo: boolean
      }
    }) => comercialService.tiposEvento.actualizar(codigo, payload),
    onSuccess: () => {
      invalidar()
      toast.success('Tipo de evento actualizado')
    },
    onError: () => toast.error('Error al actualizar el tipo de evento'),
  })

  const eliminar = useMutation({
    mutationFn: (codigo: string) => comercialService.tiposEvento.eliminar(codigo),
    onSuccess: () => {
      invalidar()
      toast.success('Tipo de evento eliminado')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Error al eliminar el tipo de evento')
    },
  })

  const toggleActivo = useMutation({
    mutationFn: (t: TipoEvento) =>
      comercialService.tiposEvento.actualizar(t.codigo, {
        nombre: t.nombre,
        descripcion: t.descripcion,
        icono: t.icono,
        activo: !t.activo,
        orden: t.orden,
      }),
    onSuccess: () => {
      invalidar()
      toast.success('Estado actualizado')
    },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, toggleActivo }
}
