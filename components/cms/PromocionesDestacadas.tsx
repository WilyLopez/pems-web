// components/cms/PromocionesDestacadas.tsx
// Server Component — se usa en el home para mostrar promociones activas configuradas
// para aparecer en el inicio (mostrarEnInicio: true).

import Link from 'next/link'
import { Tag, Ticket, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatCurrency } from '@/lib/utils'

interface Promocion {
  id: number
  tipoPromocion: string
  nombre: string
  descripcion?: string
  valorDescuento: number
  fechaInicio: string
  fechaFin?: string
  imagenUrl?: string
  colorDestacado?: string
  textoPublicitario?: string
  textoBoton?: string
  urlBoton?: string
  mostrarEnInicio: boolean
  mostrarDestacado: boolean
  limiteUsos?: number
  vecesUsado: number
}

async function fetchPromocionesInicio(): Promise<Promocion[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/promociones/publicas`,
      { next: { revalidate: 60 } },
    )
    if (!res.ok) return []
    const json = await res.json()
    const todas: Promocion[] = json.data ?? []
    return todas.filter(p => p.mostrarEnInicio).slice(0, 4)
  } catch {
    return []
  }
}

function formatDescuento(p: Promocion) {
  return p.tipoPromocion === 'DESCUENTO_PORCENTAJE'
    ? `${p.valorDescuento}%`
    : formatCurrency(p.valorDescuento)
}

function diasRestantes(fechaFin?: string): number | null {
  if (!fechaFin) return null
  return Math.ceil((new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function MiniPromoCard({ promo }: { promo: Promocion }) {
  const color = promo.colorDestacado ?? '#00AEEF'
  const dias  = diasRestantes(promo.fechaFin)
  const href  = promo.urlBoton ?? '/zona-de-juegos'

  return (
    <Link
      href={href}
      className="group relative rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="h-1 w-full" style={{ backgroundColor: color }} />

      {promo.imagenUrl ? (
        <div className="relative h-36 overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.imagenUrl}
            alt={promo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute bottom-2 right-2 text-white font-black text-lg px-2.5 py-1 rounded-xl shadow leading-none"
            style={{ backgroundColor: color }}
          >
            {formatDescuento(promo)}<span className="text-[10px] block">OFF</span>
          </div>
        </div>
      ) : (
        <div
          className="h-24 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${color}25, ${color}08)` }}
        >
          <span className="text-3xl font-black" style={{ color }}>{formatDescuento(promo)} OFF</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{promo.nombre}</h4>

        {promo.textoPublicitario && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{promo.textoPublicitario}</p>
        )}

        {dias !== null && dias <= 5 && dias > 0 && (
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
            <Clock className="h-3 w-3" /> Finaliza en {dias} día{dias !== 1 ? 's' : ''}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground mt-auto flex items-center gap-1">
          <Tag className="h-3 w-3" />
          Válida desde {formatDate(promo.fechaInicio)}
        </p>
      </div>
    </Link>
  )
}

export async function PromocionesDestacadas() {
  const promociones = await fetchPromocionesInicio()

  if (promociones.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-[#F64B8A]/10 text-[#F64B8A] border-[#F64B8A]/20 mb-2">
              Ofertas especiales
            </Badge>
            <h2 className="text-3xl font-black text-gray-900">Promociones activas</h2>
          </div>
          <Link
            href="/promociones"
            className="hidden sm:flex items-center gap-1 text-sm text-[#00AEEF] font-semibold hover:gap-2 transition-all"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promociones.map(p => <MiniPromoCard key={p.id} promo={p} />)}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button asChild variant="outline" className="rounded-full border-[#00AEEF] text-[#00AEEF] gap-2">
            <Link href="/promociones">
              Ver todas las promociones <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
