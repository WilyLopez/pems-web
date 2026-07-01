import Link from 'next/link'
import { CheckCircle, ArrowRight, PartyPopper, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { usePaquetesPublico } from '@/hooks/useComercial'
import { formatCurrency } from '@/lib/utils'

export function HomePaquetes() {
  const { data: paquetes, isLoading } = usePaquetesPublico()

  if (isLoading) return null
  if (!paquetes?.length) return null

  const mostrar =
    paquetes.filter((p) => p.destacado).slice(0, 3).length >= 2
      ? paquetes.filter((p) => p.destacado).slice(0, 3)
      : paquetes.slice(0, 3)

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-3">
            Celebraciones
          </Badge>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            El cumpleaños perfecto empieza aquí
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Paquetes diseñados para que cada celebración sea única e
            inolvidable. Tú eliges, nosotros nos encargamos del resto.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((paquete) => {
            const baseColor = paquete.color || '#00AEEF'
            return (
              <div
                key={paquete.id}
                className={`relative rounded-2xl border overflow-hidden flex flex-col transition-all hover:shadow-lg ${
                  paquete.destacado
                    ? 'border-brand-rosa/30 ring-4 ring-brand-rosa/10 shadow-md'
                    : 'bg-white border-gray-100'
                }`}
              >
                {/* Image banner */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {paquete.imagenUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={paquete.imagenUrl}
                      alt={paquete.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}aa 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                      <PartyPopper className="h-10 w-10 text-white/40 relative z-10" />
                    </div>
                  )}
                  {paquete.destacado && (
                    <div className="absolute top-3 left-3 bg-brand-rosa text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full">
                      Destacado
                    </div>
                  )}
                  {paquete.badge && (
                    <div
                      className="absolute top-3 right-3 text-white text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: baseColor }}
                    >
                      {paquete.badge}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{paquete.nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {paquete.descripcionCorta}
                    </p>
                    {paquete.descripcionLarga && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed border-l-2 border-gray-200 pl-2 italic">
                        {paquete.descripcionLarga}
                      </p>
                    )}
                  </div>

                  <p className="text-2xl font-black" style={{ color: baseColor }}>
                    {formatCurrency(paquete.precio)}
                  </p>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold">
                    {paquete.duracionMinutos && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" style={{ color: baseColor }} />
                        {Math.round(paquete.duracionMinutos / 60)}h
                        {paquete.duracionMinutos % 60 > 0 ? ` ${paquete.duracionMinutos % 60}min` : ''}
                      </span>
                    )}
                    {paquete.limitepersonas && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-brand-rosa" />
                        Hasta {paquete.limitepersonas} personas
                      </span>
                    )}
                  </div>

                  {paquete.beneficios && paquete.beneficios.length > 0 && (
                    <ul className="space-y-1.5 flex-1">
                      {paquete.beneficios.slice(0, 4).map((b) => (
                        <li
                          key={b}
                          className="flex items-center gap-2 text-xs text-gray-600"
                        >
                          <CheckCircle
                            className="h-3 w-3 shrink-0"
                            style={{ color: baseColor }}
                          />
                          {b}
                        </li>
                      ))}
                      {paquete.beneficios.length > 4 && (
                        <li className="text-xs text-gray-400 ml-5">
                          +{paquete.beneficios.length - 4} más incluidos
                        </li>
                      )}
                    </ul>
                  )}

                  <Button
                    asChild
                    size="sm"
                    className="text-white rounded-full mt-auto"
                    style={{ backgroundColor: baseColor }}
                  >
                    <Link href="/celebraciones">
                      Ver detalles <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 gap-2"
          >
            <Link href="/celebraciones">
              <PartyPopper className="h-5 w-5" />
              Ver todos los paquetes
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
