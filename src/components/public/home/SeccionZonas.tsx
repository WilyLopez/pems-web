import Link from 'next/link'
import { Gamepad2, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { ZonaJuego } from '@/types/comercial.types'

async function getZonas(): Promise<ZonaJuego[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/zonas`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.data as ZonaJuego[]) ?? []
  } catch {
    return []
  }
}

function SeccionZonasFallback() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4 text-center">
        <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 mb-3">
          Zona de Juegos
        </Badge>
        <h2 className="text-4xl font-black text-gray-900 mb-3">
          Horas de diversión garantizada
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Más de 15 atracciones diseñadas para niños de 1 a 12 años, con supervisión constante
          y medidas de seguridad en cada rincón.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full px-10 font-bold gap-2"
        >
          <Link href="/zona-de-juegos">
            <Gamepad2 className="h-5 w-5" />
            Ver la Zona de Juegos
          </Link>
        </Button>
      </div>
    </section>
  )
}

function ZonaCard({ zona }: { zona: ZonaJuego }) {
  const imagen = zona.imagenes[0]
  const edades =
    zona.edadMinima != null && zona.edadMaxima != null
      ? `${zona.edadMinima}–${zona.edadMaxima} años`
      : zona.edadMinima != null
        ? `Desde ${zona.edadMinima} años`
        : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-brand transition-all hover:-translate-y-1 group">
      <div className="h-40 bg-brand-azul/10 overflow-hidden">
        {imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imagen}
            alt={zona.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Gamepad2 className="h-12 w-12 text-brand-azul/40" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 mb-1">{zona.nombre}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{zona.descripcion}</p>
        {edades && (
          <span className="mt-2 inline-block text-xs font-semibold text-brand-azul bg-brand-azul/8 rounded-full px-3 py-0.5">
            {edades}
          </span>
        )}
      </div>
    </div>
  )
}

export async function SeccionZonas() {
  const zonas = await getZonas()
  if (!zonas.length) return <SeccionZonasFallback />

  const destacadas = zonas.filter((z) => z.destacada).slice(0, 6)
  const mostrar = destacadas.length >= 3 ? destacadas : zonas.slice(0, 6)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 mb-3">
            Zona de Juegos
          </Badge>
          <h2 className="text-4xl font-black text-gray-900 mb-3">
            Horas de diversión garantizada
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Atracciones diseñadas para niños de todas las edades, con supervisión constante
            y medidas de seguridad en cada rincón.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((zona) => (
            <ZonaCard key={zona.id} zona={zona} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full px-10 font-bold gap-2"
          >
            <Link href="/zona-de-juegos">
              <Ticket className="h-5 w-5" />
              Ver zona completa y reservar
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
