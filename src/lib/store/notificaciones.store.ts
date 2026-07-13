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
  leidaEn: Date | null
  href?: string
}

interface NotificacionesState {
  notificaciones: Notificacion[]
  noLeidas: number
  cargando: boolean
  cargandoMas: boolean
  page: number
  totalPages: number
  ultimaActualizacion: number | null
  panelAbierto: boolean
  fetchNotificaciones: () => Promise<void>
  cargarMas: () => Promise<void>
  fetchCount: () => Promise<void>
  marcarLeida: (id: string) => Promise<void>
  marcarTodasLeidas: () => Promise<void>
  eliminarNotificacion: (id: string) => Promise<void>
  setPanelAbierto: (open: boolean) => void
}

const TAMANIO_PAGINA = 30

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
    leidaEn: dto.leidaAt ? new Date(dto.leidaAt) : null,
    href: dto.urlAccion ?? undefined,
  }
}

export const useNotificacionesStore = create<NotificacionesState>(
  (set, get) => ({
    notificaciones: [],
    noLeidas: 0,
    cargando: false,
    cargandoMas: false,
    page: 0,
    totalPages: 1,
    ultimaActualizacion: null,
    panelAbierto: false,

    fetchNotificaciones: async () => {
      set({ cargando: true })
      try {
        const [pagina, count] = await Promise.all([
          getApi().feed({ size: TAMANIO_PAGINA }),
          getApi().count(),
        ])
        set({
          notificaciones: pagina.content.map(toNotificacion),
          noLeidas: count,
          page: pagina.page,
          totalPages: pagina.totalPages,
          ultimaActualizacion: Date.now(),
        })
      } catch {
        // silent — no interrumpir la UI si no hay sesion activa
      } finally {
        set({ cargando: false })
      }
    },

    cargarMas: async () => {
      const { page, totalPages, cargandoMas } = get()
      if (cargandoMas || page + 1 >= totalPages) return

      set({ cargandoMas: true })
      try {
        const pagina = await getApi().feed({
          size: TAMANIO_PAGINA,
          page: page + 1,
        })
        set((s) => ({
          notificaciones: [
            ...s.notificaciones,
            ...pagina.content.map(toNotificacion),
          ],
          page: pagina.page,
          totalPages: pagina.totalPages,
        }))
      } catch {
        // silent — el usuario puede reintentar
      } finally {
        set({ cargandoMas: false })
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
      const prevNoLeidas = get().noLeidas
      const yaLeida = prevNotifs.find((n) => n.id === id)?.leida ?? true

      set((s) => ({
        notificaciones: s.notificaciones.map((n) =>
          n.id === id
            ? { ...n, leida: true, leidaEn: n.leidaEn ?? new Date() }
            : n
        ),
        noLeidas: Math.max(0, s.noLeidas - (yaLeida ? 0 : 1)),
      }))

      try {
        await getApi().marcarLeida(Number(id))
      } catch {
        set({ notificaciones: prevNotifs, noLeidas: prevNoLeidas })
      }
    },

    eliminarNotificacion: async (id: string) => {
      const prevNotifs = get().notificaciones
      const prevNoLeidas = get().noLeidas
      const eliminada = prevNotifs.find((n) => n.id === id)

      set((s) => ({
        notificaciones: s.notificaciones.filter((n) => n.id !== id),
        noLeidas:
          eliminada && !eliminada.leida
            ? Math.max(0, s.noLeidas - 1)
            : s.noLeidas,
      }))

      try {
        await getApi().eliminar(Number(id))
      } catch {
        set({ notificaciones: prevNotifs, noLeidas: prevNoLeidas })
      }
    },

    setPanelAbierto: (open) => set({ panelAbierto: open }),

    marcarTodasLeidas: async () => {
      const prevNotifs = get().notificaciones
      const prevNoLeidas = get().noLeidas

      set((s) => ({
        notificaciones: s.notificaciones.map((n) => ({
          ...n,
          leida: true,
          leidaEn: n.leidaEn ?? new Date(),
        })),
        noLeidas: 0,
      }))

      try {
        await getApi().marcarTodasLeidas()
      } catch {
        set({ notificaciones: prevNotifs, noLeidas: prevNoLeidas })
      }
    },
  })
)
