import { useTurnos } from './useEventos'
import { useDisponibilidadRango } from '@/hooks/useDisponibilidad'
import { esTurnoDisponible } from '../utils/turnoDisponibilidad'
import { Turno } from '../types'

export interface TurnoConDisponibilidad extends Turno {
  disponible: boolean
}

export function useTurnoDisponibleParaFecha(
  idSede: number | null,
  fecha: string | null
) {
  const { data: turnos, isLoading: loadingTurnos } = useTurnos(idSede)
  const { data: disponibilidades, isLoading: loadingDisp } =
    useDisponibilidadRango(idSede ?? 0, fecha ?? '', fecha ?? '')

  const disp = fecha
    ? disponibilidades?.find((d) => d.fecha === fecha)
    : undefined

  const turnosConDisponibilidad: TurnoConDisponibilidad[] = (turnos ?? []).map(
    (t) => ({ ...t, disponible: esTurnoDisponible(t.codigo, disp) })
  )

  return {
    turnos: turnosConDisponibilidad,
    loading: loadingTurnos || loadingDisp,
  }
}
