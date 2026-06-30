import { create } from 'zustand'
import {
  notificacionesAdminService,
  notificacionesClienteService,
} from '@/services/notificaciones.service'
import {
  NotificacionDTO,
  TipoVisual,
  TIPO_VISUAL_MAP,
} from '@/types/notificaciones.types'
import { useAuthStore } from './auth.store'

export type { TipoVisual }
export type TipoNotificacion = TipoVisual

export interface Notificacion {
  id: string
  tipo: TipoVisual
  titulo: string
  mensaje: string
  fecha: Date
  leida: boolean
  href?: string
}

interface NotificacionesState {
  notificaciones: Notificacion[]
  noLeidas: number
  cargando: boolean
  ultimaActualizacion: number | null
  panelAbierto: boolean
  fetchNotificaciones: () => Promise<void>
  fetchCount: () => Promise<void>
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  setPanelAbierto: (open: boolean) => void
}

function getApi() {
  const { tipoPerfil } = useAuthStore.getState()
  return tipoPerfil === 'CLIENTE'
    ? notificacionesClienteService
    : notificacionesAdminService
}

function toNotificacion(dto: NotificacionDTO): Notificacion {
  return {
    id: String(dto.id),
    tipo: TIPO_VISUAL_MAP[dto.tipoCodigo] ?? 'sistema',
    titulo: dto.titulo,
    mensaje: dto.mensaje,
    fecha: new Date(dto.createdAt),
    leida: dto.leida,
    href: dto.urlAccion ?? undefined,
  }
}

export const useNotificacionesStore = create<NotificacionesState>(
  (set, get) => ({
    notificaciones: [],
    noLeidas: 0,
    cargando: false,
    ultimaActualizacion: null,
    panelAbierto: false,

    fetchNotificaciones: async () => {
      set({ cargando: true })
      try {
        const page = await getApi().feed({ size: 30 })
        const notifs = page.content.map(toNotificacion)
        set({
          notificaciones: notifs,
          noLeidas: notifs.filter((n) => !n.leida).length,
          ultimaActualizacion: Date.now(),
        })
      } catch {
        // silent — no interrumpir la UI si no hay sesion activa
      } finally {
        set({ cargando: false })
      }
    },

    fetchCount: async () => {
      try {
        const count = await getApi().count()
        set({ noLeidas: count })
      } catch {
        // silent
      }
    },

    marcarLeida: async (id: string) => {
      const prevNotifs = get().notificaciones
      const yaLeida = prevNotifs.find((n) => n.id === id)?.leida ?? true

      set((s) => ({
        notificaciones: s.notificaciones.map((n) =>
          n.id === id ? { ...n, leida: true } : n
        ),
        noLeidas: Math.max(0, s.noLeidas - (yaLeida ? 0 : 1)),
      }))

      try {
        await getApi().marcarLeida(Number(id))
      } catch {
        set({ notificaciones: prevNotifs })
      }
    },

    setPanelAbierto: (open) => set({ panelAbierto: open }),

    marcarTodasLeidas: async () => {
      const prevNotifs = get().notificaciones

      set((s) => ({
        notificaciones: s.notificaciones.map((n) => ({ ...n, leida: true })),
        noLeidas: 0,
      }))

      try {
        await getApi().marcarTodasLeidas()
      } catch {
        set({ notificaciones: prevNotifs })
      }
    },
  })
)
