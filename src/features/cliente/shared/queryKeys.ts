/**
 * Centralized query keys for the Cliente module.
 * Prevents magic strings and enables precise cache invalidation.
 */
export const clienteKeys = {
  all: ['cliente'] as const,

  // ── Perfil ───────────────────────────────────────────────
  perfil: (id?: number | null) => ['cliente', 'perfil', id] as const,

  // ── Reservas ─────────────────────────────────────────────
  reservas: {
    all: ['cliente', 'reservas'] as const,
    list: (params?: { page?: number; size?: number }) =>
      ['cliente', 'reservas', 'list', params] as const,
  },

  // ── Eventos ──────────────────────────────────────────────
  eventos: {
    all: ['cliente', 'eventos'] as const,
    list: (params?: { page?: number; size?: number }) =>
      ['cliente', 'eventos', 'list', params] as const,
    detalle: (id: number) => ['cliente', 'eventos', 'detalle', id] as const,
  },
} as const
