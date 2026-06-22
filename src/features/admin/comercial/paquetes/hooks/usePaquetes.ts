'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import { COMERCIAL_QUERY_KEYS } from '@/features/admin/comercial/shared/queryKeys'
import { PaqueteEvento, CrearPaquetePayload, ActualizarPaquetePayload, BeneficioPaquete } from '@/types/comercial.types'

export function usePaquetesAdmin() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.paquetesAdmin(),
    queryFn: comercialService.paquetes.listarAdmin,
  })
}

export function usePaquetesPublico() {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.paquetesPublico(),
    queryFn: comercialService.paquetes.listarActivos,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePaquete(id: number | undefined) {
  return useQuery({
    queryKey: ['paquetes', id],
    queryFn: () => comercialService.paquetes.obtener(id!),
    enabled: !!id,
  })
}

export function usePaqueteMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['paquetes'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearPaquetePayload) => comercialService.paquetes.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Paquete creado') },
    onError: () => toast.error('Error al crear el paquete'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarPaquetePayload }) =>
      comercialService.paquetes.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Paquete actualizado') },
    onError: () => toast.error('Error al actualizar the paquete'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.paquetes.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Paquete eliminado') },
    onError: () => toast.error('Error al eliminar el paquete'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.paquetes.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActivo = useMutation({
    mutationFn: (p: PaqueteEvento) =>
      comercialService.paquetes.actualizar(p.id, {
        nombre: p.nombre, descripcionCorta: p.descripcionCorta,
        descripcionLarga: p.descripcionLarga, precio: p.precio,
        badge: p.badge, color: p.color, imagenUrl: p.imagenUrl,
        duracionMinutos: p.duracionMinutos, limitepersonas: p.limitepersonas,
        beneficios: p.beneficios, activo: !p.activo,
        destacado: p.destacado, orden: p.orden,
        tipoEventoCodigo: p.tipoEventoCodigo ?? '',
      }),
    onSuccess: () => { invalidar(); toast.success('Estado actualizado') },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
}

export function useBeneficiosPaquete(idPaquete: number | undefined) {
  return useQuery({
    queryKey: COMERCIAL_QUERY_KEYS.beneficiosPaquete(idPaquete),
    queryFn: () => comercialService.paquetes.beneficios.listar(idPaquete!),
    enabled: !!idPaquete,
  })
}

export function useBeneficioMutations(idPaquete: number | undefined) {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: COMERCIAL_QUERY_KEYS.beneficiosPaquete(idPaquete) })
    qc.invalidateQueries({ queryKey: ['paquetes'] })
  }

  const crear = useMutation({
    mutationFn: (payload: Partial<BeneficioPaquete>) =>
      comercialService.paquetes.beneficios.crear(idPaquete!, payload),
    onSuccess: () => { invalidar(); toast.success('Beneficio añadido') },
    onError: () => toast.error('Error al añadir beneficio'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BeneficioPaquete> }) =>
      comercialService.paquetes.beneficios.actualizar(idPaquete!, id, payload),
    onSuccess: () => { invalidar(); toast.success('Beneficio actualizado') },
    onError: () => toast.error('Error al actualizar beneficio'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.paquetes.beneficios.eliminar(idPaquete!, id),
    onSuccess: () => { invalidar(); toast.success('Beneficio eliminado') },
    onError: () => toast.error('Error al eliminar beneficio'),
  })

  return { crear, actualizar, eliminar }
}
