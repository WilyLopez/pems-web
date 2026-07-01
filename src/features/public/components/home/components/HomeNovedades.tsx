import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useNovedades } from '../../../hooks/useNovedades'
import { fileUrl } from '@/lib/utils'

export function HomeNovedades() {
  const { data: novedades, isLoading } = useNovedades()

  if (isLoading) return null
  if (!novedades?.length) return null

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

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {novedades.slice(0, 6).map((nov) => (
            <div
              key={nov.id}
              className="rounded-2xl border bg-gray-50 hover:shadow-card transition-shadow overflow-hidden flex flex-col"
            >
              {nov.imagenUrl && (
                <div className="relative h-40 overflow-hidden w-full bg-gray-100">
                  <Image
                    src={fileUrl(nov.imagenUrl) ?? nov.imagenUrl}
                    alt={nov.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-w-768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {nov.titulo}
                    </h3>
                    {nov.destacada && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Destacada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {nov.descripcion}
                  </p>
                </div>
                {nov.textoCta && nov.urlCta && (
                  <Link
                    href={nov.urlCta}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-azul hover:gap-2 transition-all self-start"
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
