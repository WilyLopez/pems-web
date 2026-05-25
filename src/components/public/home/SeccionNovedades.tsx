import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { NovedadLocal } from '@/types/comercial.types'

async function getNovedades(): Promise<NovedadLocal[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/novedades/home`,
      { next: { revalidate: 120 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as NovedadLocal[]) ?? []
  } catch {
    return []
  }
}

export async function SeccionNovedades() {
  const novedades = await getNovedades()
  if (!novedades.length) return null

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30 mb-2">
              Novedades
            </Badge>
            <h2 className="text-3xl font-black text-gray-900">
              Lo que viene en Kiki y Lala
            </h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {novedades.slice(0, 6).map((nov) => (
            <div
              key={nov.id}
              className="rounded-2xl border bg-gray-50 hover:shadow-card transition-shadow overflow-hidden"
            >
              {nov.imagenUrl && (
                <div className="h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={nov.imagenUrl}
                    alt={nov.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 leading-tight">{nov.titulo}</h3>
                  {nov.destacada && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Destacada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {nov.descripcion}
                </p>
                {nov.textoCta && nov.urlCta && (
                  <Link
                    href={nov.urlCta}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-azul hover:gap-2 transition-all"
                  >
                    {nov.textoCta} <ArrowRight className="h-3 w-3" />
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
