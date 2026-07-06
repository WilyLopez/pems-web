'use client'

import { usePromocionesPublicas } from '../hooks/usePromocionesPublicas'
import { PromoCard } from './PromoCard'

export function HomePromociones() {
  const { data: promociones } = usePromocionesPublicas()

  if (!promociones || promociones.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Promociones y descuentos
            </h2>
            <p className="mt-2 text-gray-600">
              Aprovecha nuestras ofertas por tiempo limitado.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promociones.map((p) => (
            <PromoCard key={p.id} promo={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
