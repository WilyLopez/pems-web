'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBanners } from '../hooks/useBanners'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { fileUrl } from '@/lib/utils'
import type { Banner } from '@/types/banner.types'

const AUTOPLAY_MS = 5000

function useBannerCarousel() {
  const { idSedeActiva } = useSedesPublicas()
  const { data: rawBanners } = useBanners(idSedeActiva ?? undefined)

  const banners: Banner[] = (rawBanners ?? [])
    .filter((b) => b.activo)
    .sort((a, b) => a.prioridad - b.prioridad || a.orden - b.orden)

  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAutoplay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const goTo = useCallback(
    (idx: number) => {
      setCurrent(((idx % banners.length) + banners.length) % banners.length)
    },
    [banners.length]
  )

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
    clearAutoplay()
  }, [banners.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners.length])

  useEffect(() => {
    setCurrent(0)
  }, [banners.length])

  useEffect(() => {
    clearAutoplay()
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length)
    }, AUTOPLAY_MS)
    return clearAutoplay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length])

  return { banners, current, prev, next, goTo }
}

export function HomeHeroBanner() {
  const { banners, current, prev, next, goTo } = useBannerCarousel()
  const total = banners.length

  if (total === 0) return null

  const banner = banners[current]
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mobileSrc}
        alt={banner.titulo}
        className="absolute inset-0 h-full w-full object-cover sm:hidden"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={desktopSrc}
        alt={banner.titulo}
        className="absolute inset-0 hidden h-full w-full object-cover sm:block"
        draggable={false}
      />

      {tieneTexto && (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 sm:p-6">
          {banner.titulo && (
            <p className="line-clamp-1 text-base font-black leading-tight text-white drop-shadow-lg sm:text-xl">
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
    <section className="container max-w-6xl mx-auto px-4 pt-20 sm:pt-24">
      <div className="relative aspect-[2/1] overflow-hidden rounded-2xl shadow-lg sm:aspect-[970/250]">
        {banner.enlaceDestino ? (
          <Link href={banner.enlaceDestino} className="absolute inset-0 block">
            {contenido}
          </Link>
        ) : (
          <div className="absolute inset-0">{contenido}</div>
        )}

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
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir al banner ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? 'h-1.5 w-5 bg-white'
                      : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
