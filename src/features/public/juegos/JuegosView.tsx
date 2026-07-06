'use client'

import { JuegosHero } from './components/JuegosHero'
import { JuegosPrecios } from './components/JuegosPrecios'
import { JuegosZonas } from './components/JuegosZonas'
import { JuegosHorarios } from './components/JuegosHorarios'
import { JuegosReglas } from './components/JuegosReglas'
import { JuegosCta } from './components/JuegosCta'

export function JuegosView() {
  return (
    <>
      <JuegosHero />
      <JuegosPrecios />
      <JuegosZonas />
      <JuegosHorarios />
      <JuegosReglas />
      <JuegosCta />
    </>
  )
}
