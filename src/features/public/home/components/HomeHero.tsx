'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Zap, Ticket, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { useContenidoPublico } from '@/features/public/shared/hooks/useContenidoPublico'
import { usePublicConfig } from '@/features/public/shared/hooks/usePublicConfig'
import { cn } from '@/lib/utils'
import {
  ANIO_FUNDACION_DEFAULT,
  calcularAniosExperiencia,
} from '@/lib/experiencia'

export function HomeHero() {
  const { texto } = useContenidoPublico()
  const { data: config } = usePublicConfig()
  const mascota1Url = config?.mascota1Url
  const mascota2Url = config?.mascota2Url
  const hayMascotas = !!(mascota1Url || mascota2Url)

  const aniosExperiencia = calcularAniosExperiencia(
    texto('home.hero.stats.anio_fundacion', String(ANIO_FUNDACION_DEFAULT))
  )

  return (
    <section className="relative overflow-hidden">
      {/* ── Decorative blurs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-azul/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-rosa/15 rounded-full blur-3xl" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-16 sm:py-20 relative z-10">
        <div
          className={cn(
            'grid items-center gap-10',
            hayMascotas && 'lg:grid-cols-[1fr_1.15fr]'
          )}
        >
          <div className="max-w-2xl space-y-8 text-white">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-brand-amarillo">
                <Zap className="h-4 w-4" />
                {texto('home.hero.badge', 'El local más divertido de Chiclayo')}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight drop-shadow-lg">
                  <span className="text-white">
                    {texto('home.hero.titulo_linea1', 'Diversión')}
                  </span>
                  <br />
                  <span className="text-brand-azul">
                    {texto('home.hero.titulo_linea2', 'sin límites')}
                  </span>
                </h1>
                <p className="text-lg text-white/80 max-w-lg leading-relaxed drop-shadow">
                  {texto(
                    'home.hero.parrafo',
                    'El espacio donde los niños son los protagonistas. Juegos, celebraciones privadas y momentos que jamás olvidarán, en un ambiente seguro y lleno de alegría.'
                  )}
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  variant="brand"
                  asChild
                  className="px-8 h-12 text-base gap-2"
                >
                  <Link href="/cliente/reservar">
                    <Ticket className="h-5 w-5" />
                    Reservar ahora
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/celebraciones">
                    Ver Celebraciones
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal
              delay={0.24}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-amarillo drop-shadow">
                  {texto('home.hero.stats.familias', '+500')}
                </div>
                <div className="text-xs text-white/60">Familias felices</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-azul drop-shadow">
                  {texto('home.hero.stats.calificacion', '4.9')}
                </div>
                <div className="text-xs text-white/60 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-brand-amarillo text-brand-amarillo" />
                  Calificación
                </div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-menta drop-shadow">
                  +{aniosExperiencia}
                </div>
                <div className="text-xs text-white/60">Años de experiencia</div>
              </div>
            </Reveal>
          </div>

          {hayMascotas && (
            <Reveal delay={0.3} className="flex justify-center lg:justify-end">
              <div className="relative h-72 w-72 sm:h-96 sm:w-96 lg:h-[32rem] lg:w-[28rem]">
                <div className="absolute left-1/2 bottom-4 h-20 w-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-azul/40 via-white/10 to-brand-rosa/40 blur-2xl sm:h-28 sm:w-56 lg:h-36 lg:w-72" />
                <div className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-br from-brand-azul/25 to-brand-rosa/25 blur-3xl" />
                {mascota2Url && (
                  <div className="mascota-float-a absolute -right-2 top-0 h-40 w-40 drop-shadow-2xl sm:h-56 sm:w-56 lg:h-72 lg:w-72 [mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)]">
                    <Image
                      src={mascota2Url}
                      alt="Mascota"
                      fill
                      unoptimized={mascota2Url.startsWith('http')}
                      className="object-contain"
                      sizes="(min-width: 1024px) 288px, (min-width: 640px) 224px, 160px"
                    />
                  </div>
                )}
                {mascota1Url && (
                  <div className="mascota-float-b absolute left-0 bottom-0 h-60 w-56 drop-shadow-2xl sm:h-80 sm:w-72 lg:h-[28rem] lg:w-[24rem] [mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_68%,transparent_100%)]">
                    <Image
                      src={mascota1Url}
                      alt="Mascota"
                      fill
                      unoptimized={mascota1Url.startsWith('http')}
                      className="object-contain"
                      sizes="(min-width: 1024px) 384px, (min-width: 640px) 288px, 224px"
                      priority
                    />
                  </div>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {/* ── Wave bottom divider ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
