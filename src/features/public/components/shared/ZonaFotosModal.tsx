'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import { fileUrl } from '@/lib/utils'

interface ZonaFotosModalProps {
  open: boolean
  onClose: () => void
  imagenes: string[]
  nombreZona: string
  initialIndex?: number
}

export function ZonaFotosModal({
  open,
  onClose,
  imagenes,
  nombreZona,
  initialIndex = 0,
}: ZonaFotosModalProps) {
  const [current, setCurrent] = useState(initialIndex)

  useEffect(() => {
    if (open) setCurrent(initialIndex)
  }, [open, initialIndex])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + imagenes.length) % imagenes.length)
  }, [imagenes.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % imagenes.length)
  }, [imagenes.length])

  useEffect(() => {
    if (!open) return
    // Prevent page scroll while modal is open
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [open, onClose, prev, next])

  if (!open) return null

  const src = fileUrl(imagenes[current]) ?? imagenes[current]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl mx-4 bg-gray-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-brand-rosa" />
            <span className="text-white font-bold text-sm truncate max-w-[200px]">
              {nombreZona}
            </span>
            <span className="text-white/40 text-xs font-mono">
              {current + 1} / {imagenes.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Main image ── */}
        <div className="relative bg-black shrink-0" style={{ height: '60vh' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            src={src}
            alt={`${nombreZona} foto ${current + 1}`}
            className="w-full h-full object-contain select-none"
            draggable={false}
          />

          {/* Prev / Next arrows */}
          {imagenes.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all hover:scale-110 shadow-lg"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {imagenes.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {imagenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all ${
                    i === current
                      ? 'w-5 h-2 bg-white'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnails strip ── */}
        {imagenes.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-gray-900 border-t border-white/10 shrink-0">
            {imagenes.map((img, i) => {
              const thumbSrc = fileUrl(img) ?? img
              return (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === current
                      ? 'border-brand-rosa shadow-lg shadow-brand-rosa/30'
                      : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                  style={{ width: 72, height: 56 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbSrc}
                    alt={`Miniatura ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
