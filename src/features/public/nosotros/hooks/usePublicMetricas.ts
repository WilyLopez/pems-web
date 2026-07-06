'use client'

import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'
import { useContenidoPublico } from '@/features/public/shared/hooks/useContenidoPublico'
import {
  ANIO_FUNDACION_DEFAULT,
  calcularAniosExperiencia,
} from '@/lib/experiencia'

export interface PublicMetricas {
  familiasFelices: string
  eventosRealizados: string
  aniosExperiencia: string
  calificacionPromedio: string
}

const DEFAULTS: PublicMetricas = {
  familiasFelices: '+500',
  eventosRealizados: '+200',
  aniosExperiencia: '+2',
  calificacionPromedio: '4.9',
}

export function usePublicMetricas(): PublicMetricas {
  const { data: config } = usePublicConfig()
  const { texto } = useContenidoPublico()

  const anios = calcularAniosExperiencia(
    texto('home.hero.stats.anio_fundacion', String(ANIO_FUNDACION_DEFAULT))
  )

  let metricas: PublicMetricas = { ...DEFAULTS }

  if (config?.metricasNegocio) {
    try {
      metricas = { ...metricas, ...JSON.parse(config.metricasNegocio) }
    } catch {
      metricas = { ...DEFAULTS }
    }
  }

  return { ...metricas, aniosExperiencia: `+${anios}` }
}
