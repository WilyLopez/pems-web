'use client'

import Link from 'next/link'
import { ArrowRight, Newspaper } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { useNovedadesPublico } from '@/hooks/useComercial'

export function NovedadesHome() {
  const { data: novedades = [], isLoading, isError } = useNovedadesPublico()

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        </div>
      </section>
    )
  }

  if (isError || novedades.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30 mb-2">
              Novedades
            </Badge>
            <h2 className="text-3xl font-black text-gray-900">Lo que viene en Kiki y Lala</h2>
          </div>
          <Link
            href="/zona-de-juegos"
            className="hidden sm:flex items-center gap-1 text-sm text-brand-azul font-semibold hover:gap-2 transition-all"
          >
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {novedades.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-brand-azul/20 bg-brand-azul/5 hover:shadow-card transition-shadow overflow-hidden"
            >
              {n.imagenUrl ? (
                <img src={n.imagenUrl} alt={n.titulo} className="w-full aspect-video object-cover" />
              ) : (
                <div className="p-5 pb-0">
                  <Newspaper className="h-6 w-6 text-brand-azul" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900">{n.titulo}</h3>
                  {n.textoCta && !n.urlCta && (
                    <Badge variant="secondary" className="text-xs shrink-0">{n.textoCta}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">{n.descripcion}</p>
                {n.urlCta && n.textoCta && (
                  <Link
                    href={n.urlCta}
                    className="text-xs text-brand-azul font-semibold hover:underline mt-2 inline-block"
                  >
                    {n.textoCta} &rarr;
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
