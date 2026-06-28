'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Ticket,
  Star,
  Shield,
  ChevronRight,
  Users,
  User,
  Zap,
  Heart,
  PartyPopper,
  Gamepad2,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useBanners } from '../../hooks/useBanners'
import { useNovedades } from '../../hooks/useNovedades'
import { usePromociones } from '../../hooks/usePromociones'
import { useZonas } from '../../hooks/useZonas'
import { usePaquetes } from '../../hooks/usePaquetes'
import { useTestimonios } from '../../hooks/useTestimonios'
import {
  TestimoniosSkeleton,
  PromocionesSkeleton,
  Skeleton,
} from '../shared/Skeletons'
import { fileUrl, formatCurrency, formatDate } from '@/lib/utils'

const SEDE_ID = 1

function HomeHeroBanner() {
  const { data: banners, isLoading } = useBanners(SEDE_ID)
  const banner = banners?.[0]

  if (isLoading) {
    return (
      <div className="flex justify-center relative mt-8 lg:mt-0">
        <Skeleton className="w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] rounded-3xl" />
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="flex justify-center relative mt-8 lg:mt-0">
        <div className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px]">
          <div className="absolute inset-0 bg-brand-gradient rounded-3xl opacity-30 blur-2xl scale-110" />
          <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-brand-azul/30 to-brand-rosa/30 backdrop-blur h-full flex items-center justify-center">
            <Image
              src="/logo-principal.png"
              alt="Kiki y Lala"
              fill
              className="object-contain drop-shadow-2xl animate-float p-6"
              priority
            />
          </div>
          <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 bg-brand-amarillo text-gray-900 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black shadow-lg rotate-6 flex items-center gap-1.5 animate-pulse">
            <Zap className="h-4 w-4" />
            Nuevo show
          </div>
          <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold shadow-lg -rotate-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-azul" />
            100% Seguro
          </div>
        </div>
      </div>
    )
  }

  const content = (
    <div className="flex justify-center relative mt-8 lg:mt-0">
      <div className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px]">
        <div className="absolute inset-0 bg-brand-gradient rounded-3xl opacity-30 blur-2xl scale-110" />
        <div className="relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-gradient-to-br from-brand-azul/30 to-brand-rosa/30 backdrop-blur h-full">
          <Image
            src={fileUrl(banner.imagenUrl) ?? banner.imagenUrl}
            alt={banner.titulo}
            fill
            className="object-cover"
            sizes="(max-w-768px) 280px, 420px"
            priority
          />
          {banner.descripcion && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <p className="text-white font-bold text-sm leading-snug line-clamp-2">
                {banner.descripcion}
              </p>
            </div>
          )}
        </div>
        <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 bg-brand-amarillo text-gray-900 rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black shadow-lg rotate-6 flex items-center gap-1.5">
          <Zap className="h-4 w-4" />
          {banner.titulo}
        </div>
        {banner.enlaceDestino && (
          <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-xl sm:rounded-2xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold shadow-lg -rotate-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-azul" />
            Ver más
          </div>
        )}
      </div>
    </div>
  )

  if (banner.enlaceDestino) {
    return (
      <Link href={banner.enlaceDestino} className="contents">
        {content}
      </Link>
    )
  }

  return content
}

function HomeNovedades() {
  const { data: novedades, isLoading } = useNovedades()

  if (isLoading) return null
  if (!novedades?.length) return null

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge className="bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30 mb-2">
              Novedades
            </Badge>
            <h2 className="text-3xl font-black text-gray-900">
              Lo que viene en Kiki y Lala
            </h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {novedades.slice(0, 6).map((nov) => (
            <div
              key={nov.id}
              className="rounded-2xl border bg-gray-50 hover:shadow-card transition-shadow overflow-hidden flex flex-col"
            >
              {nov.imagenUrl && (
                <div className="relative h-40 overflow-hidden w-full bg-gray-100">
                  <Image
                    src={fileUrl(nov.imagenUrl) ?? nov.imagenUrl}
                    alt={nov.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-w-768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 leading-tight">
                      {nov.titulo}
                    </h3>
                    {nov.destacada && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Destacada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {nov.descripcion}
                  </p>
                </div>
                {nov.textoCta && nov.urlCta && (
                  <Link
                    href={nov.urlCta}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-azul hover:gap-2 transition-all self-start"
                  >
                    {nov.textoCta} <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HomePromociones() {
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

function HomeZonas() {
  const { data: zonas, isLoading } = useZonas()

  if (isLoading) return null
  if (!zonas?.length) return null

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
            Atracciones diseñadas para niños de todas las edades, con
            supervisión constante y medidas de seguridad en cada rincón.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((zona) => {
            const imagen = zona.imagenes[0]
            const edades =
              zona.edadMinima != null && zona.edadMaxima != null
                ? `${zona.edadMinima}–${zona.edadMaxima} años`
                : zona.edadMinima != null
                  ? `Desde ${zona.edadMinima} años`
                  : null

            return (
              <div
                key={zona.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-brand transition-all hover:-translate-y-1 group flex flex-col"
              >
                <div className="h-40 bg-brand-azul/10 overflow-hidden relative">
                  {imagen ? (
                    <Image
                      src={fileUrl(imagen) ?? imagen}
                      alt={zona.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-w-768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Gamepad2 className="h-12 w-12 text-brand-azul/40" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {zona.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {zona.descripcion}
                    </p>
                  </div>
                  {edades && (
                    <span className="mt-3 inline-block text-xs font-semibold text-brand-azul bg-brand-azul/8 rounded-full px-3 py-0.5 self-start">
                      {edades}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
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

function HomePaquetes() {
  const { data: paquetes, isLoading } = usePaquetes()

  if (isLoading) return null
  if (!paquetes?.length) return null

  const mostrar =
    paquetes.filter((p) => p.destacado).slice(0, 3).length >= 2
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
            Paquetes diseñados para que cada celebración sea única e
            inolvidable. Tú eliges, nosotros nos encargamos del resto.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mostrar.map((paquete, i) => {
            const destacado = i === 1
            return (
              <div
                key={paquete.id}
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
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {paquete.descripcionCorta}
                  </p>
                </div>

                <p className="text-2xl font-black text-brand-azul">
                  {formatCurrency(paquete.precio)}
                </p>

                {paquete.beneficios && paquete.beneficios.length > 0 && (
                  <ul className="space-y-1.5 flex-1">
                    {paquete.beneficios.slice(0, 4).map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 text-xs text-gray-600"
                      >
                        <CheckCircle className="h-3 w-3 text-brand-menta shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  asChild
                  size="sm"
                  className={
                    destacado
                      ? 'bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full mt-auto'
                      : 'bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full mt-auto'
                  }
                >
                  <Link href="/celebraciones">
                    Ver detalles <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            )
          })}
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

function HomeTestimonios() {
  const { data: pagedData, isLoading } = useTestimonios(0, 6)

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-24 mx-auto mb-3" />
            <Skeleton className="h-10 w-72 mx-auto" />
          </div>
          <TestimoniosSkeleton />
        </div>
      </section>
    )
  }

  // Filter only featured or take the ones available
  const list = pagedData?.content?.filter((r) => r.mostrarHome) ?? []
  if (list.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30 mb-3">
            Testimonios
          </Badge>
          <h2 className="text-4xl font-black text-gray-900">
            Lo que dicen las familias
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.slice(0, 3).map((t) => (
            <div
              key={t.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-card transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.calificacion }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-amarillo text-brand-amarillo"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4 font-medium italic">
                  &ldquo;{t.contenido}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                {t.fotoUrl ? (
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={fileUrl(t.fotoUrl) ?? t.fotoUrl}
                      alt={t.nombreAutor}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
                <span className="font-bold text-sm text-gray-900">
                  {t.nombreAutor}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PublicHomeView() {
  return (
    <>
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-rosa/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-amarillo/5 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-brand-amarillo">
                <Zap className="h-4 w-4" />
                El local más divertido de Chiclayo
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none">
                  <span className="text-white">Diversión</span>
                  <br />
                  <span className="text-brand-azul">sin límites</span>
                </h1>
                <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                  El espacio donde los niños son los protagonistas. Juegos,
                  celebraciones privadas y momentos que jamás olvidarán, en un
                  ambiente seguro y lleno de alegría.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center lg:justify-start">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/cliente/reservar">
                    <Ticket className="h-5 w-5" />
                    Reservar ahora
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/celebraciones">
                    Ver Celebraciones
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-2 w-full">
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-amarillo">
                    +500
                  </div>
                  <div className="text-xs text-white/60">Familias felices</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-azul">4.9</div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-brand-amarillo text-brand-amarillo" />
                    Calificación
                  </div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-menta">2+</div>
                  <div className="text-xs text-white/60">
                    Años de experiencia
                  </div>
                </div>
              </div>
            </div>

            <HomeHeroBanner />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      <HomeNovedades />

      <HomePromociones />

      <HomeZonas />

      <HomePaquetes />

      <section className="py-16 bg-brand-gradient text-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">
              La seguridad de tus hijos, nuestra prioridad
            </h2>
            <p className="text-white/80">
              Cada rincón de Kiki y Lala está diseñado pensando en el bienestar
              de los niños
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                titulo: 'Supervisión constante',
                desc: 'Personal capacitado en cada zona',
              },
              {
                icon: Heart,
                titulo: 'Higiene garantizada',
                desc: 'Desinfección después de cada turno',
              },
              {
                icon: Users,
                titulo: 'Personal certificado',
                desc: 'Entrenados en primeros auxilios',
              },
              {
                icon: Zap,
                titulo: 'Equipos seguros',
                desc: 'Revisión diaria de instalaciones',
              },
            ].map(({ icon: Icon, titulo, desc }) => (
              <div
                key={titulo}
                className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-1">{titulo}</h3>
                <p className="text-sm text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeTestimonios />

      <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-rosa/20 rounded-full blur-3xl" />
        </div>
        <div className="container max-w-3xl mx-auto px-4 text-center relative space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black">
            ¿Listo para la diversión?
          </h2>
          <p className="text-white/70 text-lg">
            Reserva tu próxima visita o empieza a planificar la celebración
            perfecta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-10 h-12 text-base gap-2"
            >
              <Link href="/cliente/reservar">
                <Ticket className="h-5 w-5" />
                Reservar ahora
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-12 text-base gap-2"
            >
              <Link href="/celebraciones">
                <PartyPopper className="h-5 w-5" />
                Ver Celebraciones
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
