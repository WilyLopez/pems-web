import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import {
  CrearPaquetePayload,
  ActualizarPaquetePayload,
  CrearZonaPayload,
  ActualizarZonaPayload,
  CrearActividadPayload,
  ActualizarActividadPayload,
  CrearNovedadPayload,
  ActualizarNovedadPayload,
} from '@/types/comercial.types'

const STALE_5M = 1000 * 60 * 5

// ── Paquetes ─────────────────────────────────────────────────────────────────

export function usePaquetesAdmin() {
  return useQuery({
    queryKey: ['paquetes', 'admin'],
    queryFn: comercialService.paquetes.listarAdmin,
  })
}

export function usePaquetesPublico() {
  return useQuery({
    queryKey: ['paquetes', 'publico'],
    queryFn: comercialService.paquetes.listarActivos,
    staleTime: STALE_5M,
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
    onError: () => toast.error('Error al actualizar el paquete'),
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

  return { crear, actualizar, eliminar, reordenar }
}

// ── Zonas ─────────────────────────────────────────────────────────────────────

export function useZonasAdmin() {
  return useQuery({
    queryKey: ['zonas', 'admin'],
    queryFn: comercialService.zonas.listarAdmin,
  })
}

export function useZonasPublico() {
  return useQuery({
    queryKey: ['zonas', 'publico'],
    queryFn: comercialService.zonas.listarActivas,
    staleTime: STALE_5M,
  })
}

export function useZonaMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['zonas'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearZonaPayload) => comercialService.zonas.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Zona creada') },
    onError: () => toast.error('Error al crear la zona'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarZonaPayload }) =>
      comercialService.zonas.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Zona actualizada') },
    onError: () => toast.error('Error al actualizar la zona'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.zonas.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Zona eliminada') },
    onError: () => toast.error('Error al eliminar la zona'),
  })

  const agregarMedia = useMutation({
    mutationFn: ({ id, url, tipo }: { id: number; url: string; tipo: string }) =>
      comercialService.zonas.agregarMedia(id, url, tipo),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al agregar media'),
  })

  const eliminarMedia = useMutation({
    mutationFn: ({ id, url }: { id: number; url: string }) =>
      comercialService.zonas.eliminarMedia(id, url),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al eliminar media'),
  })

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.zonas.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  return { crear, actualizar, eliminar, agregarMedia, eliminarMedia, reordenar }
}

// ── Actividades ───────────────────────────────────────────────────────────────

export function useActividadesAdmin() {
  return useQuery({
    queryKey: ['actividades', 'admin'],
    queryFn: comercialService.actividades.listarAdmin,
  })
}

export function useActividadesPublico() {
  return useQuery({
    queryKey: ['actividades', 'publico'],
    queryFn: comercialService.actividades.listarActivas,
    staleTime: STALE_5M,
  })
}

export function useActividadMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['actividades'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearActividadPayload) => comercialService.actividades.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Actividad creada') },
    onError: () => toast.error('Error al crear la actividad'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarActividadPayload }) =>
      comercialService.actividades.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Actividad actualizada') },
    onError: () => toast.error('Error al actualizar la actividad'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.actividades.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Actividad eliminada') },
    onError: () => toast.error('Error al eliminar la actividad'),
  })

  return { crear, actualizar, eliminar }
}

// ── Novedades ─────────────────────────────────────────────────────────────────

export function useNovedadesAdmin() {
  return useQuery({
    queryKey: ['novedades', 'admin'],
    queryFn: comercialService.novedades.listarAdmin,
  })
}

export function useNovedadesPublico() {
  return useQuery({
    queryKey: ['novedades', 'home'],
    queryFn: comercialService.novedades.listarHome,
    staleTime: STALE_5M,
  })
}

export function useNovedadMutations() {
  const qc = useQueryClient()
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['novedades'] })
  }

  const crear = useMutation({
    mutationFn: (payload: CrearNovedadPayload) => comercialService.novedades.crear(payload),
    onSuccess: () => { invalidar(); toast.success('Novedad creada') },
    onError: () => toast.error('Error al crear la novedad'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarNovedadPayload }) =>
      comercialService.novedades.actualizar(id, payload),
    onSuccess: () => { invalidar(); toast.success('Novedad actualizada') },
    onError: () => toast.error('Error al actualizar la novedad'),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => comercialService.novedades.eliminar(id),
    onSuccess: () => { invalidar(); toast.success('Novedad eliminada') },
    onError: () => toast.error('Error al eliminar la novedad'),
  })

  return { crear, actualizar, eliminar }
}
