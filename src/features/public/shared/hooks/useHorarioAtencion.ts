'use client'

import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'
import { formatHora12h } from '@/lib/horario'

const DIAS_SEMANA = ['1', '2', '3', '4', '5']
const DIAS_FIN_DE_SEMANA = ['6', '7']

export function useHorarioAtencion() {
  const { idSedeActiva } = useSedesPublicas()
  const idSede = idSedeActiva ?? 0
  const { data } = useConfiguracionCalendarioPublica(idSede)

  const dias = new Set(
    (data?.diasOperacion ?? '')
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
  )

  const rango = data
    ? `${formatHora12h(data.horaApertura)} – ${formatHora12h(data.horaCierre)}`
    : undefined

  const tieneSemana = DIAS_SEMANA.some((d) => dias.has(d))
  const tieneFinDeSemana = DIAS_FIN_DE_SEMANA.some((d) => dias.has(d))

  return {
    cargando: !data,
    horarioSemana: data ? (tieneSemana ? rango : 'Cerrado') : undefined,
    horarioFinDeSemana: data
      ? tieneFinDeSemana
        ? rango
        : 'Cerrado'
      : undefined,
  }
}
