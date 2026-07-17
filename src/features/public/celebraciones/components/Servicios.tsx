'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Skeleton } from '@/features/public/shared/components/Skeletons'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'
import { useServiciosCotizacion } from '@/hooks/useEventos'
import { ServicioDetalleModal } from './ServicioDetalleModal'

export function Servicios() {
  const { data: servicios = [], isLoading } = useServiciosCotizacion()
  const [servicioActivo, setServicioActivo] = useState<number | null>(null)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | null>(null)

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(
          servicios
            .map((s) => s.categoriaNombre)
            .filter((c): c is string => !!c)
        )
      ),
    [servicios]
  )

  const serviciosFiltrados = categoriaFiltro
    ? servicios.filter((s) => s.categoriaNombre === categoriaFiltro)
    : servicios

  if (!isLoading && servicios.length === 0) return null

  const servicio = servicios.find((s) => s.id === servicioActivo) ?? null

  return (
    <section id="servicios" className="scroll-mt-20 py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          title="Servicios a la carta"
          titleClassName="text-4xl"
          description="Suma experiencias extra a tu paquete o arma tu evento a medida"
          className="mb-8"
        />

        {!isLoading && categorias.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setCategoriaFiltro(null)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-colors',
                categoriaFiltro === null
                  ? 'border-brand-azul bg-brand-azul text-white'
                  : 'border-gray-200 text-gray-500 hover:border-brand-azul/40'
              )}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaFiltro(cat)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-colors',
                  categoriaFiltro === cat
                    ? 'border-brand-azul bg-brand-azul text-white'
                    : 'border-gray-200 text-gray-500 hover:border-brand-azul/40'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviciosFiltrados.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setServicioActivo(s.id)}
                className={cn(
                  'text-left bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-brand transition-all hover:-translate-y-1 flex flex-col relative',
                  s.destacado
                    ? 'border-brand-azul ring-4 ring-brand-azul/10 shadow-lg'
                    : 'border-gray-100'
                )}
              >
                {s.destacado && (
                  <div className="absolute top-4 left-4 bg-brand-azul text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full z-10">
                    Destacado
                  </div>
                )}

                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {s.imagenPrincipal ? (
                    <Image
                      src={s.imagenPrincipal}
                      alt={s.nombre}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-azul to-brand-azul/70 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                      <Sparkles className="h-10 w-10 text-white/40 relative z-10" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    {s.categoriaNombre && (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brand-azul/70">
                        {s.categoriaNombre}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {s.nombre}
                    </h3>
                    {s.descripcion && (
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                        {s.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-black text-brand-azul">
                      {s.tieneVariantes
                        ? `Desde ${formatCurrency(s.precioDesde ?? 0)}`
                        : s.precioReferencial
                          ? formatCurrency(s.precioReferencial)
                          : 'A consultar'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-azul">
                      Ver detalle
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <ServicioDetalleModal
        servicio={servicio}
        open={servicioActivo !== null}
        onClose={() => setServicioActivo(null)}
      />
    </section>
  )
}
