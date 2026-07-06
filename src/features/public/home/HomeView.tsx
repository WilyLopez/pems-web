'use client'

import { HomeHeroBanner } from './components/HomeHeroBanner'
import { HomeHero } from './components/HomeHero'
import { HomeNovedades } from './components/HomeNovedades'
import { HomePromociones } from './components/HomePromociones'
import { HomeProductos } from './components/HomeProductos'
import { HomeActividades } from './components/HomeActividades'
import { HomeSeguridad } from './components/HomeSeguridad'
import { HomeTestimonios } from './components/HomeTestimonios'
import { HomeCta } from './components/HomeCta'

export function HomeView() {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c]">
        <HomeHeroBanner />
        <HomeHero />
      </div>
      <HomeNovedades />
      <HomePromociones />
      <HomeProductos />
      <HomeActividades />
      <HomeSeguridad />
      <HomeTestimonios />
      <HomeCta />
    </>
  )
}
