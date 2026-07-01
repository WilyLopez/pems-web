'use client'

import { usePublicConfig } from '../../hooks/usePublicConfig'
import { JuegosHero } from './components/JuegosHero'
import { JuegosPrecios } from './components/JuegosPrecios'
import { JuegosZonas } from './components/JuegosZonas'
import { JuegosHorarios } from './components/JuegosHorarios'
import { JuegosReglas } from './components/JuegosReglas'
import { JuegosCta } from './components/JuegosCta'

export function ZonaDeJuegosView() {
  const { data: config } = usePublicConfig()

  return (
    <>
      <JuegosHero />
      <JuegosPrecios />
      <JuegosZonas />
      <JuegosHorarios config={config} />
      <JuegosReglas config={config} />
      <JuegosCta />
    </>
  )
}
