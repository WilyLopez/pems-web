import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comercialService } from '@/services/comercial.service'
import {
  PaqueteEvento,
  ZonaJuego,
  ActividadLocal,
  NovedadLocal,
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

  const toggleActivo = useMutation({
    mutationFn: (p: PaqueteEvento) =>
      comercialService.paquetes.actualizar(p.id, {
        nombre: p.nombre, descripcionCorta: p.descripcionCorta,
        descripcionLarga: p.descripcionLarga, precio: p.precio,
        badge: p.badge, color: p.color, imagenUrl: p.imagenUrl,
        duracionMinutos: p.duracionMinutos, limitepersonas: p.limitepersonas,
        beneficios: p.beneficios, activo: !p.activo,
        destacado: p.destacado, orden: p.orden,
      }),
    onSuccess: () => { invalidar(); toast.success('Estado actualizado') },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
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

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.zonas.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActivo = useMutation({
    mutationFn: (z: ZonaJuego) =>
      comercialService.zonas.actualizar(z.id, {
        nombre: z.nombre, descripcion: z.descripcion,
        edadMinima: z.edadMinima, edadMaxima: z.edadMaxima,
        imagenes: z.imagenes, videos: z.videos,
        activa: !z.activa, destacada: z.destacada, orden: z.orden,
      }),
    onSuccess: () => { invalidar(); toast.success('Estado actualizado') },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
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

  const reordenar = useMutation({
    mutationFn: ({ id, nuevoOrden }: { id: number; nuevoOrden: number }) =>
      comercialService.actividades.reordenar(id, nuevoOrden),
    onSuccess: () => invalidar(),
    onError: () => toast.error('Error al reordenar'),
  })

  const toggleActivo = useMutation({
    mutationFn: (a: ActividadLocal) =>
      comercialService.actividades.actualizar(a.id, {
        nombre: a.nombre, descripcion: a.descripcion,
        imagenUrl: a.imagenUrl, idZona: a.idZona,
        esEspecial: a.esEspecial, fechaInicio: a.fechaInicio,
        fechaFin: a.fechaFin, activa: !a.activa,
        destacada: a.destacada, orden: a.orden,
      }),
    onSuccess: () => { invalidar(); toast.success('Estado actualizado') },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, reordenar, toggleActivo }
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

  const toggleActivo = useMutation({
    mutationFn: (n: NovedadLocal) =>
      comercialService.novedades.actualizar(n.id, {
        titulo: n.titulo, descripcion: n.descripcion,
        imagenUrl: n.imagenUrl, textoCta: n.textoCta,
        urlCta: n.urlCta, prioridad: n.prioridad,
        fechaInicio: n.fechaInicio, fechaFin: n.fechaFin,
        visibleHome: n.visibleHome, destacada: n.destacada,
        activa: !n.activa,
      }),
    onSuccess: () => { invalidar(); toast.success('Estado actualizado') },
    onError: () => toast.error('No se pudo cambiar el estado'),
  })

  return { crear, actualizar, eliminar, toggleActivo }
}
