import Link from 'next/link'
import Image from 'next/image'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { usePromociones } from '../../../hooks/usePromociones'
import { PromocionesSkeleton } from '../../shared/Skeletons'
import { Skeleton } from '../../shared/Skeletons'
import { fileUrl, formatCurrency, formatDate } from '@/lib/utils'

export function HomePromociones() {
  const { data: promociones, isLoading } = usePromociones()

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-10 w-64" />
          </div>
          <PromocionesSkeleton />
        </div>
      </section>
    )
  }

  const visibles =
    promociones?.filter((p) => p.mostrarEnInicio).slice(0, 4) ?? []
  if (visibles.length === 0) return null

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-[#F64B8A]/10 text-[#F64B8A] border-[#F64B8A]/20 mb-2">
              Ofertas especiales
            </Badge>
            <h2 className="text-3xl font-black text-gray-900">
              Promociones activas
            </h2>
          </div>
          <Link
            href="/promociones"
            className="hidden sm:flex items-center gap-1 text-sm text-[#00AEEF] font-semibold hover:gap-2 transition-all"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibles.map((p) => {
            const color = p.colorDestacado ?? '#00AEEF'
            const limit = p.fechaFin
              ? Math.ceil(
                  (new Date(p.fechaFin).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                )
              : null
            const href = p.urlBoton ?? '/zona-de-juegos'
            const descuentoStr =
              p.tipoPromocion === 'DESCUENTO_PORCENTAJE'
                ? `${p.valorDescuento}%`
                : formatCurrency(p.valorDescuento)

            return (
              <Link
                key={p.id}
                href={href}
                className="group relative rounded-2xl overflow-hidden border bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: color }}
                />
                {p.imagenUrl ? (
                  <div className="relative h-36 overflow-hidden bg-gray-100">
                    <Image
                      src={fileUrl(p.imagenUrl) ?? p.imagenUrl}
                      alt={p.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, 25vw"
                    />
                    <div
                      className="absolute bottom-2 right-2 text-white font-black text-lg px-2.5 py-1 rounded-xl shadow leading-none"
                      style={{ backgroundColor: color }}
                    >
                      {descuentoStr}
                      <span className="text-[10px] block text-center font-bold">
                        OFF
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${color}25, ${color}08)`,
                    }}
                  >
                    <span className="text-3xl font-black" style={{ color }}>
                      {descuentoStr} OFF
                    </span>
                  </div>
                )}
                <div className="flex flex-col flex-1 p-4 gap-2">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">
                    {p.nombre}
                  </h4>
                  {p.textoPublicitario && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {p.textoPublicitario}
                    </p>
                  )}
                  {limit !== null && limit <= 5 && limit > 0 && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                      <Clock className="h-3 w-3" /> Finaliza en {limit} día
                      {limit !== 1 ? 's' : ''}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-auto flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Válida desde {formatDate(p.fechaInicio)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#00AEEF] text-[#00AEEF] gap-2"
          >
            <Link href="/promociones">
              Ver todas las promociones <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
