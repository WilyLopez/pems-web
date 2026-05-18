// app/(public)/eventos/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import {
  PartyPopper,
  Check,
  Phone,
  Clock,
  Users,
  Star,
  ChevronRight,
  Baby,
  GraduationCap,
  Palette,
  Building2,
  Cake,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Eventos Privados | Kiki y Lala' }

const tiposEventos = [
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

const paquetes = [
  {
    id: 'basico',
    nombre: 'Paquete Básico',
    icon: PartyPopper,
    precio: 350,
    duracion: '2 horas',
    capacidad: '15 niños',
    colorBorder: 'border-brand-azul/30',
    colorHeader: 'bg-brand-azul/10',
    badge: null,
    incluye: [
      'Uso exclusivo del área de juegos',
      'Decoración básica de cumpleaños',
      'Mesa de dulces y snacks',
      'Música y ambiente festivo',
      'Coordinador de evento',
    ],
    extras: ['Torta personalizada +S/80', 'Pinata +S/40'],
  },
  {
    id: 'premium',
    nombre: 'Paquete Premium',
    icon: Star,
    precio: 650,
    duracion: '3 horas',
    capacidad: '30 niños',
    colorBorder: 'border-brand-rosa/40',
    colorHeader: 'bg-gradient-to-br from-brand-rosa/15 to-brand-amarillo/10',
    badge: 'Más popular',
    incluye: [
      'Uso exclusivo de todo el local',
      'Decoración temática a elección',
      'Torta de 2 pisos incluida',
      'Catering para niños y adultos',
      'Animación y juegos dirigidos',
      'Recuerdos para los invitados',
      'Coordinador + asistente',
    ],
    extras: ['DJ +S/150', 'Cobertura fotografica +S/200'],
  },
  {
    id: 'vip',
    nombre: 'Paquete VIP',
    icon: Palette,
    precio: 1100,
    duracion: '4 horas',
    capacidad: '50 niños',
    colorBorder: 'border-brand-amarillo/40',
    colorHeader: 'bg-gradient-to-br from-brand-amarillo/15 to-brand-menta/10',
    badge: 'Todo incluido',
    incluye: [
      'Uso exclusivo total del local',
      'Decoración premium personalizada',
      'Torta temática 3 pisos',
      'Catering completo buffet',
      'DJ + animación profesional',
      'Show de personajes (1 hora)',
      'Cobertura fotográfica y video',
      'Recuerdos premium para invitados',
      '2 coordinadores dedicados',
    ],
    extras: ['Photobooth +S/100', 'Personaje adicional +S/150'],
  },
]

export default function EventosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-brand-rosa/10 via-white to-brand-amarillo/10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient" />
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
          <Badge className="bg-brand-rosa/15 text-brand-rosa border-brand-rosa/30 text-sm px-4 py-1">
            Eventos Privados
          </Badge>
          <h1 className="text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            Celebraciones mágicas en{' '}
            <span className="text-brand-rosa">Kiki y Lala</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
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
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5 gap-2"
            >
              <a
                href="https://wa.me/51999999999"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="h-5 w-5" />
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Tipos */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              ¿Qué tipo de evento quieres celebrar?
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tiposEventos.map(({ icon: Icon, nombre, desc }) => (
              <div
                key={nombre}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-brand-rosa/30 hover:shadow-brand-rosa transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-rosa/10 flex items-center justify-center shrink-0 group-hover:bg-brand-rosa group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5 text-brand-rosa group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{nombre}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paquetes */}
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

          <div className="grid gap-6 lg:grid-cols-3">
            {paquetes.map(
              ({
                id,
                nombre,
                icon: Icon,
                precio,
                duracion,
                capacidad,
                colorBorder,
                colorHeader,
                badge,
                incluye,
                extras,
              }) => (
                <div
                  key={id}
                  className={`bg-white rounded-3xl border-2 ${colorBorder} overflow-hidden shadow-card hover:shadow-brand transition-all hover:-translate-y-1 relative flex flex-col`}
                >
                  {badge && (
                    <div className="absolute top-4 right-4 bg-brand-rosa text-white text-xs font-bold px-3 py-1 rounded-full">
                      {badge}
                    </div>
                  )}
                  <div className={`${colorHeader} p-6`}>
                    <Icon className="h-7 w-7 text-brand-azul mb-2" />
                    <h3 className="text-xl font-black text-gray-900">
                      {nombre}
                    </h3>
                    <div className="flex items-end gap-1 mt-2">
                      <span className="text-4xl font-black text-brand-azul">
                        S/ {precio}
                      </span>
                    </div>
                    <div className="flex gap-3 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand-azul" />
                        {duracion}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-brand-rosa" />
                        {capacidad}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <ul className="space-y-2.5 flex-1">
                      {incluye.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <div className="w-5 h-5 rounded-full bg-brand-menta/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-emerald-600" />
                          </div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {extras.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                          Extras disponibles
                        </p>
                        {extras.map((e) => (
                          <p key={e} className="text-xs text-gray-500">
                            + {e}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 space-y-2">
                      <Button
                        asChild
                        className="w-full bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold"
                      >
                        <Link href={`/eventos-privados?paquete=${id}`}>
                          Reservar este paquete
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-500 gap-1"
                      >
                        <a
                          href={`https://wa.me/51999999999?text=Hola! Me interesa el ${nombre}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Consultar por WhatsApp
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-10">
            ¿Cómo reservar tu evento?
          </h2>
          <div className="grid gap-6 sm:grid-cols-4">
            {[
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
            ].map(({ n, icon: Icon, titulo, desc }) => (
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

      {/* CTA */}
      <section className="py-16 bg-brand-gradient text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl font-black">¿Tienes alguna duda?</h2>
          <p className="text-white/80">
            Nuestro equipo está listo para ayudarte a planificar el evento
            perfecto.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-rosa hover:bg-white/90 rounded-full font-bold px-10 gap-2"
          >
            <a
              href="https://wa.me/51999999999"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-5 w-5" />
              Hablar con nosotros
            </a>
          </Button>
        </div>
      </section>
    </>
  )
}
