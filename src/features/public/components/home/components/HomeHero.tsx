'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Zap,
  Ticket,
  ChevronRight,
  Star,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Monitor,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBanners } from '../../../hooks/useBanners'
import { fileUrl } from '@/lib/utils'
import type { Banner } from '@/types/banner.types'

const SEDE_ID = 1
const DEFAULT_OVERLAY = '#001a2c'
const AUTOPLAY_MS = 5000

/** Filter and sort banners for the current viewport */
function useBannerCarousel() {
  const { data: rawBanners } = useBanners(SEDE_ID)

  // Filter: activo=true, respect soloMovil / soloDesktop at JS level using window.innerWidth
  // We derive this once and memoize — actual responsive hiding is done via CSS on the img tags
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
    [banners.length],
  )

  const prev = useCallback(() => {
    setCurrent((c) => ((c - 1) + banners.length) % banners.length)
    clearAutoplay()
  }, [banners.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length)
  }, [banners.length])

  // Reset when list changes
  useEffect(() => {
    setCurrent(0)
  }, [banners.length])

  // Autoplay — restart whenever banner count or current changes
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

export function HomeHero() {
  const { banners, current, prev, next, goTo } = useBannerCarousel()

  const banner = banners[current] ?? null
  const overlayHex = banner?.colorOverlay ?? DEFAULT_OVERLAY
  const total = banners.length

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Background images — all stacked, only current visible ── */}
      {banners.length > 0 ? (
        banners.map((b: Banner, i: number) => {
          const desktopSrc = fileUrl(b.imagenUrl) ?? b.imagenUrl
          const mobileSrc = b.imagenMovilUrl
            ? (fileUrl(b.imagenMovilUrl) ?? b.imagenMovilUrl)
            : desktopSrc

          return (
            <div
              key={b.id}
              aria-hidden={i !== current}
              className={`absolute inset-0 transition-opacity duration-[1000ms] ease-in-out ${
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } ${
                // CSS-level device filtering
                b.soloMovil ? 'sm:!opacity-0' : b.soloDesktop ? 'sm:opacity-100 max-sm:!opacity-0' : ''
              }`}
            >
              {/* Mobile image (shows only if imagenMovilUrl set AND on sm-) */}
              {b.imagenMovilUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mobileSrc}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover sm:hidden"
                  draggable={false}
                />
              )}
              {/* Desktop image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={desktopSrc}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover ${b.imagenMovilUrl ? 'hidden sm:block' : 'block'}`}
                draggable={false}
              />
            </div>
          )
        })
      ) : (
        // Fallback dark gradient when no banners
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c]" />
      )}

      {/* ── Directional overlay — color from current banner ── */}
      <div
        className="absolute inset-0 transition-colors duration-[1000ms]"
        style={{
          background: `linear-gradient(120deg, ${overlayHex}f2 0%, ${overlayHex}c0 40%, ${overlayHex}60 70%, transparent 100%)`,
        }}
      />
      {/* Bottom wave fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/8 to-transparent pointer-events-none" />

      {/* ── Decorative blurs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-azul/15 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-rosa/15 rounded-full blur-3xl" />
      </div>

      {/* ── Main content ── */}
      <div className="container max-w-6xl mx-auto px-4 pt-28 pb-28 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT — static brand copy */}
          <div className="space-y-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-brand-amarillo">
              <Zap className="h-4 w-4" />
              El local más divertido de Chiclayo
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none drop-shadow-lg">
                <span className="text-white">Diversión</span>
                <br />
                <span className="text-brand-azul">sin límites</span>
              </h1>
              <p className="text-lg text-white/80 max-w-lg leading-relaxed drop-shadow">
                El espacio donde los niños son los protagonistas. Juegos,
                celebraciones privadas y momentos que jamás olvidarán, en un
                ambiente seguro y lleno de alegría.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                asChild
                className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-8 h-12 text-base gap-2 shadow-lg"
              >
                <Link href="/cliente/reservar">
                  <Ticket className="h-5 w-5" />
                  Reservar ahora
                </Link>
              </Button>

              {/* Dynamic CTA from current banner */}
              {banner?.textoBoton && banner.enlaceDestino ? (
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-amarillo hover:bg-brand-amarillo/90 text-gray-900 font-bold rounded-full px-8 h-12 text-base gap-2 shadow-lg"
                >
                  <Link href={banner.enlaceDestino}>
                    {banner.textoBoton}
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
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
              )}
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-3xl font-black text-brand-amarillo drop-shadow">+500</div>
                <div className="text-xs text-white/60">Familias felices</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-brand-azul drop-shadow">4.9</div>
                <div className="text-xs text-white/60 flex items-center gap-1">
                  <Star className="h-3 w-3 fill-brand-amarillo text-brand-amarillo" />
                  Calificación
                </div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <div className="text-3xl font-black text-brand-menta drop-shadow">2+</div>
                <div className="text-xs text-white/60">Años de experiencia</div>
              </div>
            </div>
          </div>

          {/* RIGHT — dynamic banner promo card */}
          {banner && (
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-2 bg-white/10 rounded-3xl blur-2xl" />

                <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Banner image thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl(banner.imagenUrl) ?? banner.imagenUrl}
                      alt={banner.titulo}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* tipoBanner badge */}
                    {banner.tipoBanner && (
                      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">
                        {banner.tipoBanner}
                      </div>
                    )}

                    {/* Device restriction badge */}
                    {(banner.soloMovil || banner.soloDesktop) && (
                      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm p-1.5 rounded-full border border-white/20">
                        {banner.soloMovil
                          ? <Smartphone className="h-3.5 w-3.5 text-white" />
                          : <Monitor className="h-3.5 w-3.5 text-white" />
                        }
                      </div>
                    )}

                    {/* Carousel index on image */}
                    {total > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {current + 1}/{total}
                      </div>
                    )}
                  </div>

                  {/* Banner text content */}
                  <div className="p-5 space-y-3">
                    <div className="inline-flex items-center gap-1.5 bg-brand-amarillo text-gray-900 text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full">
                      <Zap className="h-3 w-3" />
                      Promoción activa
                    </div>

                    <h2 className="text-white font-black text-lg leading-tight">
                      {banner.titulo}
                    </h2>

                    {banner.descripcion && (
                      <p className="text-white/75 text-sm leading-relaxed">
                        {banner.descripcion}
                      </p>
                    )}

                    {banner.textoBoton && banner.enlaceDestino && (
                      <Link
                        href={banner.enlaceDestino}
                        className="flex items-center justify-center gap-2 w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full py-2.5 text-sm transition-colors shadow-lg mt-1"
                      >
                        {banner.textoBoton}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}

                    {/* Mini carousel dots on card */}
                    {total > 1 && (
                      <div className="flex items-center justify-center gap-1.5 pt-1">
                        {banners.map((_: Banner, i: number) => (
                          <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Banner ${i + 1}`}
                            className={`rounded-full transition-all duration-300 ${
                              i === current
                                ? 'w-6 h-2 bg-white'
                                : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Full-width carousel arrow controls ── */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Banner anterior"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            aria-label="Banner siguiente"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm transition-all hover:scale-110"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Bottom dot progress bar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_: Banner, i: number) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 h-2.5 bg-white shadow-md'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Wave bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
