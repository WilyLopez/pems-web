import { AFORO_UMBRAL, DASHBOARD_REFETCH } from '../config'
import { ReservasDia } from '../../shared/types'

export function saludoSegunHora(hora: number): string {
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export function porcentajeAforo(ocupado: number, maximo: number): number {
  if (maximo <= 0) return 0
  return Math.round((ocupado / maximo) * 100)
}

export type NivelAforo = 'critico' | 'alerta' | 'normal'

export function nivelAforo(porcentaje: number): NivelAforo {
  if (porcentaje >= AFORO_UMBRAL.critico) return 'critico'
  if (porcentaje >= AFORO_UMBRAL.alerta) return 'alerta'
  return 'normal'
}

export function enHorarioOperacion(hora: number): boolean {
  return (
    hora >= DASHBOARD_REFETCH.horaInicioOperacion &&
    hora < DASHBOARD_REFETCH.horaFinOperacion
  )
}

export interface StatsTendencia {
  total: number
  promedio: number
  pico: number
}

export function statsTendencia(data: ReservasDia[]): StatsTendencia {
  if (data.length === 0) return { total: 0, promedio: 0, pico: 0 }
  const total = data.reduce((acc, d) => acc + d.cantidad, 0)
  const promedio = Math.round(total / data.length)
  const pico = Math.max(...data.map((d) => d.cantidad))
  return { total, promedio, pico }
}
