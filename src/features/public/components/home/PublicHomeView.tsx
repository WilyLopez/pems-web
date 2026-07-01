'use client'

import { HomeHero } from './components/HomeHero'
import { HomeNovedades } from './components/HomeNovedades'
import { HomePromociones } from './components/HomePromociones'
import { HomeZonas } from './components/HomeZonas'
import { HomePaquetes } from './components/HomePaquetes'
import { HomeSeguridad } from './components/HomeSeguridad'
import { HomeTestimonios } from './components/HomeTestimonios'
import { HomeCta } from './components/HomeCta'

export function PublicHomeView() {
  return (
    <>
      <HomeHero />
      <HomeNovedades />
      <HomePromociones />
      <HomeZonas />
      <HomePaquetes />
      <HomeSeguridad />
      <HomeTestimonios />
      <HomeCta />
    </>
  )
}
