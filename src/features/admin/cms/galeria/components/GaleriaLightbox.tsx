'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import { ImagenGaleria } from '@/types/galeria.types'
import { categoriaLabel } from '../constants/categorias'
import { formatBytes } from '../lib/archivo'
import { formatDate } from '@/lib/utils'

interface GaleriaLightboxProps {
  imagenes: ImagenGaleria[]
  indice: number
  onIndice: (indice: number) => void
  onClose: () => void
}

export function GaleriaLightbox({
  imagenes,
  indice,
  onIndice,
  onClose,
}: GaleriaLightboxProps) {
  const total = imagenes.length
  const imagen = imagenes[indice]
  const touchStartX = useRef<number | null>(null)

  const anterior = () => onIndice((indice - 1 + total) % total)
  const siguiente = () => onIndice((indice + 1) % total)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onIndice((indice - 1 + total) % total)
      else if (e.key === 'ArrowRight') onIndice((indice + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [indice, total, onClose, onIndice])

  if (!imagen) return null

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) siguiente()
      else anterior()
    }
    touchStartX.current = null
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        onClick={stop}
      >
        <span className="text-xs font-medium text-white/70">
          {indice + 1} / {total}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onClick={stop}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={imagen.id}
          src={imagen.url}
          alt={imagen.altTexto ?? imagen.titulo ?? 'Imagen galería'}
          fill
          unoptimized
          sizes="100vw"
          className="object-contain"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div
        className="mx-auto w-full max-w-3xl px-4 pb-5 pt-3 text-white"
        onClick={stop}
      >
        <div className="flex flex-wrap items-center gap-2">
          {imagen.titulo && (
            <p className="text-sm font-semibold">{imagen.titulo}</p>
          )}
          {imagen.categoria && (
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">
              {categoriaLabel(imagen.categoria)}
            </span>
          )}
          {imagen.destacada && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-xs font-medium text-white">
              <Star className="h-3 w-3 fill-white" />
              Destacada
            </span>
          )}
        </div>
        {imagen.descripcion && (
          <p className="mt-1 text-xs text-white/70">{imagen.descripcion}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60">
          {imagen.fechaCreacion && (
            <span>Publicada el {formatDate(imagen.fechaCreacion)}</span>
          )}
          {imagen.tamanioBytes ? (
            <span>{formatBytes(imagen.tamanioBytes)}</span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
