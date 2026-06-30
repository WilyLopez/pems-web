export const DASHBOARD_OPERATIVO_QUERY_KEY = 'dashboard-operativo'

export const DASHBOARD_REFETCH = {
  staleTimeMs: 1000 * 60 * 2,
  intervaloEnOperacionMs: 1000 * 60,
  intervaloFueraOperacionMs: 1000 * 60 * 10,
  horaInicioOperacion: 8,
  horaFinOperacion: 22,
} as const

export const AFORO_UMBRAL = {
  critico: 90,
  alerta: 70,
} as const

export const ESTADO_RESERVA_STYLE: Record<string, string> = {
  CONFIRMADA: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  PENDIENTE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  COMPLETADA: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CANCELADA: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  REPROGRAMADA:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

export const ESTADO_RESERVA_LABEL: Record<string, string> = {
  CONFIRMADA: 'Confirmada',
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  REPROGRAMADA: 'Reprogramada',
}

export const RUTA_ACCION = {
  solicitudesEvento: '/admin/eventos?estado=SOLICITADA',
  eventosSaldoPendiente: '/admin/eventos?estado=CONFIRMADA',
  caja: '/admin/finanzas/caja',
  yapesPorValidar: '/admin/reservas?medioPago=YAPE&estado=PENDIENTE',
} as const

