'use client'

import Link from 'next/link'
import {
  PartyPopper,
  Check,
  Phone,
  Clock,
  Users,
  Star,
  Baby,
  GraduationCap,
  Palette,
  Building2,
  Cake,
  CalendarDays,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePublicConfig } from '../../hooks/usePublicConfig'
import { useTiposEventoPublico, usePaquetesPublico } from '@/hooks/useComercial'
import { DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { Skeleton } from '../shared/Skeletons'
import { formatCurrency } from '@/lib/utils'

const tiposEventosPorDefecto = [
  {
    icon: Cake,
    nombre: 'Cumpleaños infantiles',
    desc: 'El clásico que nunca falla. Personaliza cada detalle.',
  },
  {
    icon: Baby,
    nombre: 'Baby shower',
    desc: 'Celebra la llegada del nuevo integrante de la familia.',
  },
  {
    icon: GraduationCap,
    nombre: 'Fin de año escolar',
    desc: 'Premia a los niños con una fiesta increíble.',
  },
  {
    icon: Star,
    nombre: 'Eventos temáticos',
    desc: 'Superhéroes, princesas, dinosaurios y más.',
  },
  {
    icon: Building2,
    nombre: 'Salidas escolares',
    desc: 'Grupos de hasta 60 niños con actividades dirigidas.',
  },
  {
    icon: CalendarDays,
    nombre: 'Celebraciones familiares',
    desc: 'Reuniones y eventos con zona infantil.',
  },
]

const pasosPorDefecto = [
  {
    n: '1',
    icon: Star,
    titulo: 'Elige el paquete',
    desc: 'Selecciona el que mejor se adapte',
  },
  {
    n: '2',
    icon: CalendarDays,
    titulo: 'Elige fecha y turno',
    desc: 'Verifica disponibilidad',
  },
  {
    n: '3',
    icon: Check,
    titulo: 'Paga el adelanto',
    desc: 'Confirma con un adelanto del 30%',
  },
  {
    n: '4',
    icon: PartyPopper,
    titulo: 'A celebrar',
    desc: 'Nosotros nos encargamos del resto',
  },
]

export function CelebracionesView() {
  const { data: paquetes, isLoading: loadingPaquetes } = usePaquetesPublico()
  const { data: config } = usePublicConfig()
  const { data: tiposEventosQuery = [] } = useTiposEventoPublico()

  const tiposEventos = tiposEventosQuery.length > 0
    ? tiposEventosQuery.map((t) => ({
        icon: t.icono,
        nombre: t.nombre,
        desc: t.descripcion || '',
      }))
    : tiposEventosPorDefecto

  const whatsappNumero = config?.whatsapp?.replace(/\D/g, '') ?? null
  const whatsappUrl = whatsappNumero ? `https://wa.me/${whatsappNumero}` : null

  return (
    <>
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-brand-rosa/10 via-white to-brand-amarillo/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient" />
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
          <Badge className="bg-brand-rosa/15 text-brand-rosa border-brand-rosa/30 text-sm px-4 py-1">
            Celebraciones Privadas
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            Celebraciones mágicas en{' '}
            <span className="text-brand-rosa">Kiki y Lala</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto animate-fade-in">
            Organizamos cada detalle para que tú solo tengas que disfrutar.
            Desde cumpleaños hasta eventos temáticos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold px-8 gap-2"
            >
              <a href="#paquetes">
                <PartyPopper className="h-5 w-5" />
                Ver paquetes
              </a>
            </Button>
            {whatsappUrl && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 gap-2"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <Phone className="h-5 w-5" />
                  Cotizar por WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              ¿Qué tipo de evento quieres celebrar?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiposEventos.map(({ icon, nombre, desc }) => {
              return (
                <div
                  key={nombre}
                  className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-brand-rosa/30 hover:shadow-brand transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0 group-hover:bg-brand-rosa group-hover:text-white transition-colors">
                    {typeof icon === 'string' ? (
                      <DynamicIcon name={icon} className="h-5 w-5 text-brand-rosa group-hover:text-white" fallback={Cake} />
                    ) : (
                      (() => {
                        const IconComponent = icon as React.ElementType
                        return <IconComponent className="h-5 w-5 text-brand-rosa group-hover:text-white" />
                      })()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{nombre}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="paquetes" className="py-20 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Elige tu paquete
            </h2>
            <p className="text-gray-600">
              Todos incluyen coordinación completa y acceso exclusivo al local
            </p>
          </div>

          {loadingPaquetes ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-3xl bg-gray-200" />
              ))}
            </div>
          ) : paquetes && paquetes.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paquetes.map((paquete) => {
                const waBadge = whatsappUrl
                  ? `${whatsappUrl}?text=${encodeURIComponent(`Hola! Me interesa el ${paquete.nombre}`)}`
                  : null
                const baseColor = paquete.color || '#00AEEF'
                return (
                  <div
                    key={paquete.id}
                    className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-brand transition-all hover:-translate-y-1 relative flex flex-col justify-between ${
                      paquete.destacado
                        ? 'border-brand-rosa ring-4 ring-brand-rosa/10 shadow-lg scale-102 z-10'
                        : 'border-gray-100'
                    }`}
                  >
                    {paquete.destacado && (
                      <div className="absolute top-4 left-4 bg-brand-rosa text-white text-[10px] uppercase font-black px-3 py-1 rounded-full z-10">
                        Destacado
                      </div>
                    )}

                    {paquete.badge && (
                      <div
                        className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full z-10"
                        style={{ backgroundColor: baseColor }}
                      >
                        {paquete.badge}
                      </div>
                    )}

                    {/* Image Banner */}
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      {paquete.imagenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={paquete.imagenUrl}
                          alt={paquete.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
                          style={{
                            background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}aa 100%)`,
                          }}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                          <PartyPopper className="h-10 w-10 text-white/40 relative z-10" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-tight">
                            {paquete.nombre}
                          </h3>
                          <p className="text-sm text-gray-650 mt-1.5 leading-relaxed">
                            {paquete.descripcionCorta}
                          </p>
                          {paquete.descripcionLarga && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed border-l-2 border-gray-200 pl-2 italic">
                              {paquete.descripcionLarga}
                            </p>
                          )}
                        </div>

                        <div className="flex items-end gap-1">
                          <span
                            className="text-4xl font-black"
                            style={{ color: baseColor }}
                          >
                            {formatCurrency(paquete.precio)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 font-bold">
                          {paquete.duracionMinutos && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" style={{ color: baseColor }} />
                              {Math.round(paquete.duracionMinutos / 60)}h{' '}
                              {paquete.duracionMinutos % 60 > 0
                                ? `${paquete.duracionMinutos % 60}min`
                                : ''}
                            </span>
                          )}
                          {paquete.limitepersonas && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-brand-rosa" />
                              Hasta {paquete.limitepersonas} personas
                            </span>
                          )}
                        </div>

                        {paquete.beneficios && paquete.beneficios.length > 0 && (
                          <ul className="space-y-2 pt-2 border-t border-gray-100">
                            {paquete.beneficios.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-gray-650"
                              >
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ backgroundColor: `${baseColor}1a` }}
                                >
                                  <Check
                                    className="h-2.5 w-2.5"
                                    style={{ color: baseColor }}
                                  />
                                </div>
                                <span className="text-gray-700 leading-relaxed text-xs">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-6 space-y-2">
                        <Button
                          asChild
                          className="w-full text-white rounded-full font-bold shadow-sm"
                          style={{ backgroundColor: baseColor }}
                        >
                          <Link href="/cliente/celebraciones/solicitar">
                            Solicitar este paquete
                          </Link>
                        </Button>
                        {waBadge && (
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="w-full text-gray-500 gap-1 rounded-xl"
                          >
                            <a
                              href={waBadge}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Consultar por WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <PartyPopper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">
                Próximamente mostraremos nuestros paquetes aquí.
              </p>
              {whatsappUrl && (
                <Button
                  asChild
                  className="mt-4 bg-brand-rosa text-white rounded-full gap-2 px-6"
                >
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Consultar disponibilidad
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-10">
            ¿Cómo reservar tu celebración?
          </h2>
          <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
            {pasosPorDefecto.map(({ n, icon: Icon, titulo, desc }) => (
              <div key={n} className="relative">
                <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-black text-lg mx-auto mb-3">
                  {n}
                </div>
                <Icon className="h-5 w-5 text-brand-azul mx-auto mb-1" />
                <h3 className="font-bold text-sm text-gray-900">{titulo}</h3>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-gradient text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl font-black">¿Tienes alguna duda?</h2>
          <p className="text-white/80">
            Nuestro equipo está listo para ayudarte a planificar la celebración
            perfecta.
          </p>
          {whatsappUrl ? (
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-rosa hover:bg-white/90 rounded-full font-bold px-10 gap-2"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Hablar con nosotros
              </a>
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-rosa hover:bg-white/90 rounded-full font-bold px-10 gap-2"
            >
              <Link href="/cliente/celebraciones/solicitar">
                <PartyPopper className="h-5 w-5" />
                Solicitar información
              </Link>
            </Button>
          )}
        </div>
      </section>
    </>
  )
}
