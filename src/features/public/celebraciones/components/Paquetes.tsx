import Link from 'next/link'
import Image from 'next/image'
import { PartyPopper, Check, Clock, Users, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/features/public/shared/components/Skeletons'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'
import { formatCurrency } from '@/lib/utils'
import { PaqueteEvento } from '@/types/comercial.types'

export function Paquetes({
  paquetes,
  loading,
  whatsappUrl,
}: {
  paquetes: PaqueteEvento[] | undefined
  loading: boolean
  whatsappUrl: string | null
}) {
  return (
    <section id="paquetes" className="py-20 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          title="Elige tu paquete"
          titleClassName="text-4xl"
          description="Todos incluyen coordinación completa y acceso exclusivo al local"
          className="mb-12"
        />

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-3xl bg-gray-200" />
            ))}
          </div>
        ) : paquetes && paquetes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paquetes.map((paquete) => {
              const baseColor = paquete.color || '#00AEEF'
              return (
                <div
                  key={paquete.id}
                  className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-brand transition-all hover:-translate-y-1 relative flex flex-col justify-between ${
                    paquete.destacado
                      ? 'border-brand-rosa ring-4 ring-brand-rosa/10 shadow-lg scale-105 z-10'
                      : 'border-gray-100'
                  }`}
                >
                  {paquete.destacado && (
                    <div className="absolute top-4 left-4 bg-brand-rosa text-white text-[10px] uppercase font-black px-3 py-1 rounded-full z-10">
                      Destacado
                    </div>
                  )}

                  {paquete.badge && (
                    <div
                      className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full z-10"
                      style={{ backgroundColor: baseColor }}
                    >
                      {paquete.badge}
                    </div>
                  )}

                  <div className="aspect-video bg-gray-100 relative overflow-hidden">
                    {paquete.imagenUrl ? (
                      <Image
                        src={paquete.imagenUrl}
                        alt={paquete.nombre}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}aa 100%)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                        <PartyPopper className="h-10 w-10 text-white/40 relative z-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 leading-tight">
                          {paquete.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                          {paquete.descripcionCorta}
                        </p>
                        {paquete.descripcionLarga && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed border-l-2 border-gray-200 pl-2 italic">
                            {paquete.descripcionLarga}
                          </p>
                        )}
                      </div>

                      <div className="flex items-end gap-1">
                        <span
                          className="text-4xl font-black"
                          style={{ color: baseColor }}
                        >
                          {formatCurrency(paquete.precio)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 font-bold">
                        {paquete.duracionMinutos && (
                          <span className="flex items-center gap-1">
                            <Clock
                              className="h-3.5 w-3.5"
                              style={{ color: baseColor }}
                            />
                            {Math.round(paquete.duracionMinutos / 60)}h{' '}
                            {paquete.duracionMinutos % 60 > 0
                              ? `${paquete.duracionMinutos % 60}min`
                              : ''}
                          </span>
                        )}
                        {paquete.limitepersonas && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5 text-brand-rosa" />
                            Hasta {paquete.limitepersonas} personas
                          </span>
                        )}
                      </div>

                      {paquete.beneficios &&
                        paquete.beneficios.length > 0 && (
                          <ul className="space-y-2 pt-2 border-t border-gray-100">
                            {paquete.beneficios.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: `${baseColor}1a`,
                                  }}
                                >
                                  <Check
                                    className="h-2.5 w-2.5"
                                    style={{ color: baseColor }}
                                  />
                                </div>
                                <span className="text-gray-700 leading-relaxed text-xs">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>

                    <div className="mt-6">
                      <Button
                        asChild
                        className="w-full text-white rounded-full font-bold shadow-sm"
                        style={{ backgroundColor: baseColor }}
                      >
                        <Link href="/cliente/celebraciones/solicitar">
                          Solicitar este paquete
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <PartyPopper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">
              Próximamente mostraremos nuestros paquetes aquí.
            </p>
            {whatsappUrl && (
              <Button
                asChild
                className="mt-4 bg-brand-rosa text-white rounded-full gap-2 px-6"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Consultar disponibilidad
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
