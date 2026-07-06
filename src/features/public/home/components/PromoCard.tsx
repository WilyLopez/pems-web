import Link from 'next/link'
import { Calendar, Ticket, Clock } from 'lucide-react'
import { Promocion } from '@/services/promocion.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

const TIPO_LABEL: Record<string, string> = {
  DESCUENTO_PORCENTAJE: 'Descuento',
  DESCUENTO_MONTO_FIJO: 'Oferta',
  PAQUETE_GRUPAL: 'Paquete grupal',
  ENTRADA_GRATUITA: 'Entrada gratuita',
  CLIENTE_FRECUENTE: 'Cliente frecuente',
}

function formatDescuento(p: Promocion) {
  return p.tipoPromocion === 'DESCUENTO_PORCENTAJE'
    ? `${p.valorDescuento}%`
    : `S/ ${p.valorDescuento.toFixed(2)}`
}

function diasRestantes(fechaFin?: string): number | null {
  if (!fechaFin) return null
  return Math.ceil(
    (new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
}

export function PromoCard({
  promo,
  destacada,
}: {
  promo: Promocion
  destacada?: boolean
}) {
  const dias = diasRestantes(promo.fechaFin)
  const color = promo.colorDestacado ?? '#00AEEF'
  const href = promo.urlBoton ?? '/juegos'

  return (
    <article
      className={`relative rounded-3xl overflow-hidden border bg-white group hover:shadow-xl transition-all duration-300 flex flex-col ${
        destacada ? 'md:col-span-2' : ''
      }`}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      {promo.imagenUrl ? (
        <div
          className={`relative overflow-hidden bg-gray-100 ${destacada ? 'h-52 sm:h-64' : 'h-40'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.imagenUrl}
            alt={promo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div
            className="absolute top-3 right-3 text-white font-black text-lg leading-none px-3 py-2 rounded-2xl shadow-lg"
            style={{ backgroundColor: color }}
          >
            {formatDescuento(promo)}
            <span className="text-xs font-semibold block">OFF</span>
          </div>
        </div>
      ) : (
        <div
          className={`relative flex items-center justify-center ${destacada ? 'h-40' : 'h-28'}`}
          style={{
            background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
          }}
        >
          <div className="text-4xl font-black opacity-80" style={{ color }}>
            {formatDescuento(promo)}
          </div>
        </div>
      )}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <Badge
            variant="secondary"
            className="text-[11px] mb-2"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {TIPO_LABEL[promo.tipoPromocion] ?? promo.tipoPromocion}
          </Badge>
          <h3
            className={`font-black text-gray-900 leading-tight ${destacada ? 'text-xl' : 'text-base'}`}
          >
            {promo.nombre}
          </h3>
        </div>
        {(promo.textoPublicitario || promo.descripcion) && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {promo.textoPublicitario ?? promo.descripcion}
          </p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            Válida del {formatDate(promo.fechaInicio)}
            {promo.fechaFin ? ` al ${formatDate(promo.fechaFin)}` : ' en adelante'}
          </span>
        </div>
        {dias !== null && dias <= 5 && dias > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            <Clock className="h-3.5 w-3.5" />
            ¡Finaliza en {dias} día{dias !== 1 ? 's' : ''}!
          </div>
        )}
        <Button
          asChild
          size={destacada ? 'default' : 'sm'}
          className="w-full rounded-xl font-bold mt-1 gap-2"
          style={{ backgroundColor: color, color: '#fff' }}
        >
          <Link href={href}>
            <Ticket className="h-4 w-4" />
            {promo.textoBoton ?? 'Reservar ahora'}
          </Link>
        </Button>
      </div>
    </article>
  )
}
