'use client'

import { usePublicMetricas } from './hooks/usePublicMetricas'
import { NosotrosHero } from './components/NosotrosHero'
import { NosotrosHistoria } from './components/NosotrosHistoria'
import { NosotrosValores } from './components/NosotrosValores'
import { NosotrosFaqs } from './components/NosotrosFaqs'

export function NosotrosView() {
  const metricas = usePublicMetricas()

  return (
    <>
      <NosotrosHero aniosExperiencia={metricas.aniosExperiencia} />
      <NosotrosHistoria metricas={metricas} />
      <NosotrosValores />
      <NosotrosFaqs />
    </>
  )
}
