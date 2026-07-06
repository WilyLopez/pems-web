'use client'

import { usePromocionesPublicas } from '../hooks/usePromocionesPublicas'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'
import { PromoCard } from './PromoCard'

export function HomePromociones() {
  const { data: promociones } = usePromocionesPublicas()

  if (!promociones || promociones.length === 0) return null

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <SectionHeader
          badge="Ofertas especiales"
          badgeColor="amarillo"
          title="Promociones y descuentos"
          description="Aprovecha nuestras ofertas por tiempo limitado."
          className="mb-10"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {promociones.map((p) => (
            <PromoCard key={p.id} promo={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
