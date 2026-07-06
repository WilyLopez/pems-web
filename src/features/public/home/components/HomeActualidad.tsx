'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useNovedadesPublico, useActividadesPublico } from '@/hooks/useComercial'
import { Skeleton } from '@/features/public/shared/components/Skeletons'
import { fileUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ItemActualidad {
  key: string
  titulo: string
  descripcion: string
  imagenUrl?: string | null
  etiqueta: string
  etiquetaClass: string
  ctaTexto?: string | null
  ctaUrl?: string | null
}

export function HomeActualidad() {
  const { data: novedades, isLoading: loadingNov } = useNovedadesPublico()
  const { data: actividades, isLoading: loadingAct } = useActividadesPublico()

  if (loadingNov || loadingAct) {
    return (
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <Skeleton className="h-9 w-80 mb-10" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <Skeleton className="h-96 rounded-3xl" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const items: ItemActualidad[] = [
    ...(novedades ?? []).map((n) => ({
      key: `nov-${n.id}`,
      titulo: n.titulo,
      descripcion: n.descripcion,
      imagenUrl: n.imagenUrl,
      etiqueta: n.destacada ? 'Novedad destacada' : 'Novedad',
      etiquetaClass: 'text-yellow-700',
      ctaTexto: n.textoCta,
      ctaUrl: n.urlCta,
    })),
    ...(actividades ?? []).map((a) => ({
      key: `act-${a.id}`,
      titulo: a.nombre,
      descripcion: a.descripcion,
      imagenUrl: a.imagenUrl,
      etiqueta: a.nombreZona || 'Actividad',
      etiquetaClass: 'text-emerald-700',
    })),
  ]

  if (items.length === 0) return null

  const [destacado, ...resto] = items
  const lista = resto.slice(0, 5)
  const destacadoSrc = destacado.imagenUrl
    ? (fileUrl(destacado.imagenUrl) ?? destacado.imagenUrl)
    : null

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Está pasando en Kiki y Lala
          </h2>
          <p className="mt-2 text-gray-600">
            Novedades, actividades y dinámicas dentro de la zona de juegos.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
          <article className="group relative rounded-3xl overflow-hidden bg-gray-900 min-h-[24rem] flex flex-col justify-end">
            {destacadoSrc ? (
              <Image
                src={destacadoSrc}
                alt={destacado.titulo}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-gradient-dark flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-white/30" />
              </div>
            )}
            <div className="relative bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8 pt-20">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-amarillo">
                {destacado.etiqueta}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-white leading-snug">
                {destacado.titulo}
              </h3>
              <p className="mt-2 text-sm text-white/85 line-clamp-2 max-w-lg">
                {destacado.descripcion}
              </p>
              {destacado.ctaTexto && destacado.ctaUrl && (
                <Link
                  href={destacado.ctaUrl}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:gap-2.5 transition-all"
                >
                  {destacado.ctaTexto} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </article>

          <div className="divide-y divide-gray-100">
            {lista.map((item) => {
              const src = item.imagenUrl
                ? (fileUrl(item.imagenUrl) ?? item.imagenUrl)
                : null
              return (
                <article key={item.key} className="flex gap-4 py-4 first:pt-0">
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-menta/10">
                    {src ? (
                      <Image
                        src={src}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Sparkles className="h-5 w-5 text-brand-menta/50" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-[11px] font-semibold uppercase tracking-wide',
                        item.etiquetaClass
                      )}
                    >
                      {item.etiqueta}
                    </p>
                    <h3 className="font-semibold text-gray-900 leading-snug truncate">
                      {item.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {item.descripcion}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
