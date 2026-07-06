'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ImagenGaleria } from '@/types/galeria.types'
import { useGaleriaPublica } from '@/features/public/shared/hooks/useGaleriaPublica'

interface GaleriaPublicaProps {
  soloDestacadas?: boolean
  titulo?: string
  descripcion?: string
  verTodasHref?: string
  id?: string
}

export function GaleriaPublica({
  soloDestacadas = false,
  titulo = 'Momentos en Kiki y Lala',
  descripcion = 'Algunas de las celebraciones que hemos vivido juntos',
  verTodasHref,
  id,
}: GaleriaPublicaProps) {
  const { data: imagenes = [], isLoading } = useGaleriaPublica(soloDestacadas)
  const [activa, setActiva] = useState<number | null>(null)

  if (!isLoading && imagenes.length === 0) return null

  return (
    <section id={id} className="scroll-mt-20 bg-white py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{titulo}</h2>
          <p className="mt-2 text-gray-600">{descripcion}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {imagenes.map((imagen, indice) => (
              <button
                key={imagen.id}
                type="button"
                onClick={() => setActiva(indice)}
                aria-label={imagen.altTexto ?? imagen.titulo ?? 'Ver imagen'}
                className="group relative aspect-square overflow-hidden rounded-2xl bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-rosa"
              >
                <Image
                  src={imagen.url}
                  alt={
                    imagen.altTexto ??
                    imagen.titulo ??
                    'Celebración en Kiki y Lala'
                  }
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {verTodasHref && !isLoading && imagenes.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="gap-2 rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5"
            >
              <Link href={verTodasHref}>
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {activa !== null && (
        <Lightbox
          imagenes={imagenes}
          indice={activa}
          onIndice={setActiva}
          onClose={() => setActiva(null)}
        />
      )}
    </section>
  )
}

interface LightboxProps {
  imagenes: ImagenGaleria[]
  indice: number
  onIndice: (indice: number) => void
  onClose: () => void
}

function Lightbox({ imagenes, indice, onIndice, onClose }: LightboxProps) {
  const total = imagenes.length
  const imagen = imagenes[indice]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onIndice((indice - 1 + total) % total)
      else if (e.key === 'ArrowRight') onIndice((indice + 1) % total)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, total, onClose, onIndice])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <button
          type="button"
          aria-label="Anterior"
          onClick={(e) => {
            e.stopPropagation()
            onIndice((indice - 1 + total) % total)
          }}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-video max-h-[85vh] w-full max-w-4xl"
      >
        <Image
          src={imagen.url}
          alt={imagen.altTexto ?? imagen.titulo ?? 'Celebración en Kiki y Lala'}
          fill
          unoptimized
          sizes="90vw"
          className="object-contain"
        />
      </div>

      {total > 1 && (
        <button
          type="button"
          aria-label="Siguiente"
          onClick={(e) => {
            e.stopPropagation()
            onIndice((indice + 1) % total)
          }}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
