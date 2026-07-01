'use client'

import { usePublicConfig } from '../../hooks/usePublicConfig'
import { NosotrosHero } from './components/NosotrosHero'
import { NosotrosHistoria } from './components/NosotrosHistoria'
import { NosotrosValores } from './components/NosotrosValores'
import { NosotrosFaqs } from './components/NosotrosFaqs'
import { NosotrosContacto } from './components/NosotrosContacto'

export function NosotrosView() {
  const { data: config } = usePublicConfig()

  let metricas = {
    familiasFelices: '+500',
    eventosRealizados: '+200',
    aniosExperiencia: '2+',
    calificacionPromedio: '4.9',
  }

  if (config?.metricasNegocio) {
    try {
      const parsed = JSON.parse(config.metricasNegocio)
      metricas = { ...metricas, ...parsed }
    } catch {}
  }

  return (
    <>
      <NosotrosHero aniosExperiencia={metricas.aniosExperiencia} />
      <NosotrosHistoria metricas={metricas} />
      <NosotrosValores />
      <NosotrosFaqs />
      <NosotrosContacto config={config} />
    </>
  )
}
