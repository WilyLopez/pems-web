// app/(public)/promociones/page.tsx
import Link from 'next/link'
import { Tag, Calendar, ArrowRight, Ticket, Clock, Zap } from 'lucide-react'
import { promocionService, Promocion } from '@/services/promocion.service'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatCurrency } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDescuento(p: Promocion) {
  return p.tipoPromocion === 'DESCUENTO_PORCENTAJE'
    ? `${p.valorDescuento}%`
    : `S/ ${p.valorDescuento.toFixed(2)}`
}

function diasRestantes(fechaFin?: string): number | null {
  if (!fechaFin) return null
  return Math.ceil((new Date(fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const TIPO_LABEL: Record<string, string> = {
  DESCUENTO_PORCENTAJE: 'Descuento',
  DESCUENTO_MONTO_FIJO: 'Oferta',
  PAQUETE_GRUPAL:       'Paquete grupal',
  ENTRADA_GRATUITA:     'Entrada gratuita',
  CLIENTE_FRECUENTE:    'Cliente frecuente',
}

// ── Tarjeta pública ───────────────────────────────────────────────────────────

function PromoCardPublica({ promo, destacada }: { promo: Promocion; destacada?: boolean }) {
  const dias = diasRestantes(promo.fechaFin)
  const color = promo.colorDestacado ?? '#00AEEF'
  const href = promo.urlBoton ?? '/zona-de-juegos'

  return (
    <article
      className={`relative rounded-3xl overflow-hidden border bg-white group hover:shadow-xl transition-all duration-300 flex flex-col ${
        destacada ? 'md:col-span-2' : ''
      }`}
    >
      {/* Barra de color superior */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      {/* Imagen */}
      {promo.imagenUrl ? (
        <div className={`relative overflow-hidden bg-gray-100 ${destacada ? 'h-52 sm:h-64' : 'h-40'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promo.imagenUrl}
            alt={promo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badge destacada */}
          {promo.mostrarDestacado && (
            <div className="absolute top-3 left-3 bg-amber-400 text-gray-900 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow">
              <Zap className="h-3.5 w-3.5" /> Destacada
            </div>
          )}
          {/* Descuento overlay */}
          <div
            className="absolute top-3 right-3 text-white font-black text-lg leading-none px-3 py-2 rounded-2xl shadow-lg"
            style={{ backgroundColor: color }}
          >
            {formatDescuento(promo)}
            <span className="text-xs font-semibold block">OFF</span>
          </div>
        </div>
      ) : (
        /* Sin imagen — banner de color */
        <div
          className={`relative flex items-center justify-center ${destacada ? 'h-40' : 'h-28'}`}
          style={{ background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)` }}
        >
          <div
            className="text-4xl font-black opacity-80"
            style={{ color }}
          >
            {formatDescuento(promo)}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Tipo */}
        <div>
          <Badge variant="secondary" className="text-[11px] mb-2" style={{ backgroundColor: `${color}15`, color }}>
            {TIPO_LABEL[promo.tipoPromocion] ?? promo.tipoPromocion}
          </Badge>
          <h3 className={`font-black text-gray-900 leading-tight ${destacada ? 'text-xl' : 'text-base'}`}>
            {promo.nombre}
          </h3>
        </div>

        {/* Descripción */}
        {(promo.textoPublicitario || promo.descripcion) && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {promo.textoPublicitario ?? promo.descripcion}
          </p>
        )}

        {/* Vigencia */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>Válida del {formatDate(promo.fechaInicio)}{promo.fechaFin ? ` al ${formatDate(promo.fechaFin)}` : ' en adelante'}</span>
        </div>

        {/* Urgencia */}
        {dias !== null && dias <= 5 && dias > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            <Clock className="h-3.5 w-3.5" />
            ¡Finaliza en {dias} día{dias !== 1 ? 's' : ''}!
          </div>
        )}

        {/* Límite de usos */}
        {promo.limiteUsos && promo.vecesUsado !== undefined && (
          <div className="w-full">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Cupos usados</span>
              <span>{promo.vecesUsado} / {promo.limiteUsos}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((promo.vecesUsado / promo.limiteUsos) * 100, 100)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
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

// ── Página ────────────────────────────────────────────────────────────────────

export const revalidate = 60

async function getPromociones(): Promise<Promocion[]> {
  try {
    return await promocionService.listarPublicas()
  } catch {
    return []
  }
}

export default async function PromocionesPublicaPage() {
  const promociones = await getPromociones()

  const destacadas = promociones.filter(p => p.mostrarDestacado)
  const normales   = promociones.filter(p => !p.mostrarDestacado)

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#00AEEF]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#F64B8A]/15 rounded-full blur-3xl" />
        </div>
        <div className="container max-w-6xl mx-auto px-4 relative text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-[#F59E0B] mb-6">
            <Tag className="h-4 w-4" />
            Ofertas especiales
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Promociones y descuentos
            <br />
            <span className="text-[#00AEEF]">exclusivos para ti</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Aprovecha nuestras ofertas por tiempo limitado. Descuentos especiales, paquetes grupales y beneficios para clientes frecuentes.
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="py-14 bg-gray-50 min-h-[40vh]">
        <div className="container max-w-6xl mx-auto px-4">

          {promociones.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h2 className="text-xl font-bold text-gray-600 mb-2">Sin promociones activas en este momento</h2>
              <p className="text-gray-500 mb-6">Vuelve pronto, ¡tenemos sorpresas preparadas!</p>
              <Button asChild className="bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white rounded-full font-bold px-8 gap-2">
                <Link href="/zona-de-juegos">
                  <Ticket className="h-4 w-4" /> Ver zona de juegos
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Destacadas */}
              {destacadas.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-black text-gray-900">Ofertas destacadas</h2>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {destacadas.map((p, i) => (
                      <PromoCardPublica key={p.id} promo={p} destacada={i === 0 && destacadas.length > 1} />
                    ))}
                  </div>
                </div>
              )}

              {/* Todas las promociones */}
              {normales.length > 0 && (
                <div>
                  {destacadas.length > 0 && (
                    <div className="flex items-center gap-2 mb-5">
                      <Tag className="h-5 w-5 text-[#00AEEF]" />
                      <h2 className="text-xl font-black text-gray-900">Más ofertas disponibles</h2>
                    </div>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {normales.map(p => <PromoCardPublica key={p.id} promo={p} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-2xl font-black text-gray-900">¿Listo para reservar?</h3>
          <p className="text-gray-500">Usa tu código de promoción al momento de comprar tus entradas.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-[#F64B8A] hover:bg-[#F64B8A]/90 text-white rounded-full font-bold px-8 gap-2">
              <Link href="/zona-de-juegos"><Ticket className="h-4 w-4" /> Comprar entradas</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#00AEEF] text-[#00AEEF] hover:bg-[#00AEEF]/5 gap-2">
              <Link href="/eventos">Ver eventos privados <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
