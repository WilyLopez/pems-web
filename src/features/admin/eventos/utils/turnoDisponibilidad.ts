import { Disponibilidad } from '@/features/admin/calendario/types'

export const TURNO_DISP: Record<string, (d: Disponibilidad) => boolean> = {
  T1: (d) => d.turnoT1Disponible,
  T2: (d) => d.turnoT2Disponible,
}

export function esTurnoDisponible(
  codigoTurno: string,
  disponibilidad: Disponibilidad | undefined
): boolean {
  if (!disponibilidad) return false
  return TURNO_DISP[codigoTurno]?.(disponibilidad) ?? false
}
