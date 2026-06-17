import Link from 'next/link'
import { PartyPopper, CheckCircle, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { PaqueteEvento } from '@/types/comercial.types'

async function getPaquetes(): Promise<PaqueteEvento[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/paquetes`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as PaqueteEvento[]) ?? []
  } catch {
    return []
  }
}

const BENEFICIOS_FALLBACK = [
  'Hasta 60 invitados',
  'Decoración personalizada',
  'Animación y shows',
  'Catering incluido',
  'Coordinador dedicado',
]

function SeccionPaquetesFallback() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20">
              Celebraciones
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 leading-tight">
              El cumpleaños de tu hijo merece ser{' '}
              <span className="text-brand-rosa">inolvidable</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Organizamos celebraciones privadas exclusivas con decoración personalizada,
              animación, catering y todo lo que necesitas para crear recuerdos que duran
              para siempre.
            </p>
            <ul className="space-y-3">
              {BENEFICIOS_FALLBACK.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle className="h-4 w-4 text-brand-menta shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold gap-2"
            >
              <Link href="/celebraciones">
                <PartyPopper className="h-4 w-4" />
                Ver paquetes de celebración
              </Link>
            </Button>
          </div>
          <div className="hidden lg:block rounded-3xl bg-gradient-to-br from-brand-rosa/10 to-brand-amarillo/10 h-80 flex items-center justify-center">
            <PartyPopper className="h-24 w-24 text-brand-rosa/30" />
          </div>
        </div>
      </div>
    </section>
  )
}

function PaqueteCard({ paquete, destacado }: { paquete: PaqueteEvento; destacado?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-3 transition-all hover:shadow-lg ${
        destacado
          ? 'bg-gradient-to-br from-brand-rosa/10 to-brand-amarillo/10 border-brand-rosa/30'
          : 'bg-white border-gray-100'
      }`}
    >
      {paquete.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-rosa text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {paquete.badge}
          </span>
        </div>
      )}

      <div>
        <h3 className="font-bold text-gray-900">{paquete.nombre}</h3>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{paquete.descripcionCorta}</p>
      </div>

      <p className="text-2xl font-black text-brand-azul">
        {formatCurrency(paquete.precio)}
      </p>

      {paquete.beneficios && paquete.beneficios.length > 0 && (
        <ul className="space-y-1.5 flex-1">
          {paquete.beneficios.slice(0, 4).map((b) => (
            <li key={b} className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-brand-menta shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}

      <Button
        asChild
        size="sm"
        className={destacado
          ? 'bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full mt-auto'
          : 'bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full mt-auto'}
      >
        <Link href="/celebraciones">
          Ver detalles <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </Button>
    </div>
  )
}

export async function SeccionPaquetes() {
  const paquetes = await getPaquetes()
  if (!paquetes.length) return <SeccionPaquetesFallback />

  const mostrar = paquetes.filter((p) => p.destacado).slice(0, 3).length >= 2
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
            Paquetes diseñados para que cada celebración sea única e inolvidable.
            Tú eliges, nosotros nos encargamos del resto.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((paquete, i) => (
            <PaqueteCard
              key={paquete.id}
              paquete={paquete}
              destacado={i === 1}
            />
          ))}
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
