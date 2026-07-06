'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useBanners } from '../hooks/useBanners'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { fileUrl } from '@/lib/utils'
import type { Banner } from '@/types/banner.types'

const AUTOPLAY_MS = 5000

function BannerSlide({ banner, prioridad }: { banner: Banner; prioridad: boolean }) {
  const desktopSrc = fileUrl(banner.imagenUrl) ?? banner.imagenUrl
  const mobileSrc = banner.imagenMovilUrl
    ? (fileUrl(banner.imagenMovilUrl) ?? banner.imagenMovilUrl)
    : desktopSrc
  const tieneTexto = !!(
    banner.titulo ||
    banner.descripcion ||
    (banner.textoBoton && banner.enlaceDestino)
  )

  const contenido = (
    <>
      <picture>
        <source media="(max-width: 639px)" srcSet={mobileSrc} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={desktopSrc}
          alt={banner.titulo || 'Promoción Kiki y Lala'}
          fetchPriority={prioridad ? 'high' : 'auto'}
          loading={prioridad ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      </picture>

      {tieneTexto && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 sm:p-6">
          {banner.titulo && (
            <p className="line-clamp-1 text-base font-bold leading-tight text-white drop-shadow-lg sm:text-xl">
              {banner.titulo}
            </p>
          )}
          {banner.descripcion && (
            <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-white/85 drop-shadow sm:line-clamp-2 sm:text-sm">
              {banner.descripcion}
            </p>
          )}
          {banner.textoBoton && banner.enlaceDestino && (
            <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-azul px-3 py-1.5 text-xs font-bold text-white shadow-lg sm:px-4 sm:py-2 sm:text-sm">
              {banner.textoBoton}
            </span>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="relative min-w-0 flex-[0_0_100%]">
      <div className="relative aspect-[2/1] sm:aspect-[970/250]">
        {banner.enlaceDestino ? (
          <Link href={banner.enlaceDestino} className="absolute inset-0 block">
            {contenido}
          </Link>
        ) : (
          <div className="absolute inset-0">{contenido}</div>
        )}
      </div>
    </div>
  )
}

export function HomeHeroBanner() {
  const { idSedeActiva } = useSedesPublicas()
  const { data: rawBanners } = useBanners(idSedeActiva ?? undefined)
  const reduceMotion = useReducedMotion()

  const banners: Banner[] = useMemo(
    () =>
      (rawBanners ?? [])
        .filter((b) => b.activo)
        .sort((a, b) => a.prioridad - b.prioridad || a.orden - b.orden),
    [rawBanners]
  )

  const autoplayRef = useRef(
    Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: true })
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 24 },
    reduceMotion ? [] : [autoplayRef.current]
  )

  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(!reduceMotion)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap())
    const onStop = () => setAutoplay(false)
    emblaApi.on('select', onSelect)
    emblaApi.on('autoplay:stop', onStop)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('autoplay:stop', onStop)
    }
  }, [emblaApi])

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const goTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  const toggleAutoplay = useCallback(() => {
    const plugin = emblaApi?.plugins()?.autoplay
    if (!plugin) return
    if (plugin.isPlaying()) {
      plugin.stop()
      setAutoplay(false)
    } else {
      plugin.play()
      setAutoplay(true)
    }
  }, [emblaApi])

  const total = banners.length
  if (total === 0) return null

  return (
    <section className="container max-w-6xl mx-auto px-4 pt-20 sm:pt-24">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Promociones destacadas"
        className="relative overflow-hidden rounded-2xl shadow-lg"
      >
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex touch-pan-y">
            {banners.map((banner, i) => (
              <BannerSlide key={banner.id} banner={banner} prioridad={i === 0} />
            ))}
          </div>
        </div>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Banner anterior"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:p-2"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Banner siguiente"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:p-2"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              type="button"
              onClick={toggleAutoplay}
              aria-label={
                autoplay
                  ? 'Pausar rotación de banners'
                  : 'Reanudar rotación de banners'
              }
              className="absolute right-2 top-2 z-10 rounded-full bg-black/30 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:p-2"
            >
              {autoplay ? (
                <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              ) : (
                <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
            <div className="absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  aria-current={i === current}
                  className="group flex items-center justify-center p-2"
                >
                  <span
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? 'h-1.5 w-5 bg-white'
                        : 'h-1.5 w-1.5 bg-white/50 group-hover:bg-white/80'
                    }`}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
