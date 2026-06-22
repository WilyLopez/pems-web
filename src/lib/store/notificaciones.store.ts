import { create } from 'zustand'

export type TipoNotificacion = 'reserva' | 'evento' | 'pago' | 'contrato' | 'sistema'

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  fecha: Date
  leida: boolean
  href?: string
}

interface NotificacionesState {
  notificaciones: Notificacion[]
  marcarLeida: (id: string) => void
  marcarTodasLeidas: () => void
  agregarNotificacion: (n: Omit<Notificacion, 'id' | 'leida' | 'fecha'>) => void
}

const SEED: Notificacion[] = [
  {
    id: '1',
    tipo: 'reserva',
    titulo: 'Reserva confirmada',
    mensaje: 'Tu reserva para el 15 de junio ha sido confirmada.',
    fecha: new Date(Date.now() - 1000 * 60 * 30),
    leida: false,
    href: '/cliente/mis-reservas',
  },
  {
    id: '2',
    tipo: 'pago',
    titulo: 'Pago pendiente en caja',
    mensaje: 'Tienes una reserva con pago pendiente. Preséntate en caja.',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 3),
    leida: false,
    href: '/cliente/mis-reservas',
  },
  {
    id: '3',
    tipo: 'evento',
    titulo: 'Evento próximo',
    mensaje: 'Tu evento privado es en 2 días. Coordina los últimos detalles.',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24),
    leida: true,
    href: '/cliente/mis-eventos',
  },
  {
    id: '4',
    tipo: 'sistema',
    titulo: 'Bienvenido al portal',
    mensaje: 'Explora todas las funciones de tu área personal.',
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 48),
    leida: true,
    href: '/cliente',
  },
]

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  notificaciones: SEED,
  marcarLeida: (id) =>
    set((s) => ({
      notificaciones: s.notificaciones.map((n) =>
        n.id === id ? { ...n, leida: true } : n
      ),
    })),
  marcarTodasLeidas: () =>
    set((s) => ({
      notificaciones: s.notificaciones.map((n) => ({ ...n, leida: true })),
    })),
  agregarNotificacion: (data) =>
    set((s) => ({
      notificaciones: [
        { ...data, id: Date.now().toString(), leida: false, fecha: new Date() },
        ...s.notificaciones,
      ],
    })),
}))
