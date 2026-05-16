// app/(public)/page.tsx

import Link from 'next/link'
import {
  Ticket,
  Star,
  Shield,
  ChevronRight,
  Users,
  User,
  Zap,
  Heart,
  Phone,
  PartyPopper,
  ArrowRight,
  CheckCircle,
  Gamepad2,
  Palette,
  Music,
  Baby,
  Award,
  Camera,
} from 'lucide-react'
import { HeroBanner } from '@/components/admin/cms/HeroBanner'
import { PromocionesDestacadas } from '@/components/admin/cms/PromocionesDestacadas'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const paquetes = [
  {
    nombre: 'Paquete Básico',
    icon: PartyPopper,
    precio: 'S/ 350',
    colorGradient: 'from-brand-azul/10 to-brand-azul/5',
    badge: null,
    detalles: [
      'Hasta 15 niños',
      '2 horas de juego',
      'Decoración básica',
      'Mesa de snacks',
    ],
  },
  {
    nombre: 'Paquete Premium',
    icon: Award,
    precio: 'S/ 650',
    colorGradient: 'from-brand-rosa/15 to-brand-amarillo/10',
    badge: 'Más popular',
    detalles: [
      'Hasta 30 niños',
      '3 horas exclusivas',
      'Decoración temática',
      'Torta + snacks',
      'Animación incluida',
    ],
  },
  {
    nombre: 'Paquete VIP',
    icon: Star,
    precio: 'S/ 1,100',
    colorGradient: 'from-brand-amarillo/15 to-brand-menta/10',
    badge: 'Todo incluido',
    detalles: [
      'Hasta 50 niños',
      '4 horas exclusivas',
      'Decoración premium',
      'Catering completo',
      'DJ + animación',
      'Cobertura fotográfica',
    ],
  },
]

const testimonios = [
  {
    nombre: 'Valeria M.',
    texto:
      'El cumpleaños de mi hijo fue mágico. Todo estaba perfecto, los niños no querían irse.',
    estrellas: 5,
  },
  {
    nombre: 'Carlos R.',
    texto:
      'Excelente atención, las instalaciones muy limpias y el personal muy amable. Volvemos pronto.',
    estrellas: 5,
  },
  {
    nombre: 'Lucía P.',
    texto:
      'Mis hijos adoran Kiki y Lala. Ya es nuestra tradición de fin de semana. Los juegos son seguros y divertidos.',
    estrellas: 5,
  },
]

const actividades = [
  { icon: Zap, nombre: 'Escalada', desc: 'Muros adaptados por edades' },
  { icon: Gamepad2, nombre: 'Arcade', desc: 'Juegos electrónicos y premios' },
  { icon: Palette, nombre: 'Arte', desc: 'Taller de pintura y manualidades' },
  { icon: Baby, nombre: 'Piscina de pelotas', desc: 'Para los más pequeños' },
  {
    icon: Music,
    nombre: 'Show en vivo',
    desc: 'Personajes los fines de semana',
  },
  { icon: Camera, nombre: 'Fotobooth', desc: 'Recuerdos de tu visita' },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-rosa/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-amarillo/5 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-semibold text-brand-amarillo">
                <Zap className="h-4 w-4" />
                El local mas divertido de Chiclayo
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none">
                  <span className="text-white">Diversion</span>
                  <br />
                  <span className="text-brand-azul">sin limites</span>
                </h1>
                <p className="text-lg text-white/70 max-w-lg leading-relaxed">
                  El espacio donde los ninos son los protagonistas. Juegos,
                  eventos privados y momentos que jamas olvidaran, en un
                  ambiente seguro y lleno de alegria.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/zona-de-juegos">
                    <Ticket className="h-5 w-5" />
                    Comprar Entradas
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/eventos">
                    Ver Eventos
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-2">
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
                    Calificacion
                  </div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-menta">6+</div>
                  <div className="text-xs text-white/60">
                    Anos de experiencia
                  </div>
                </div>
              </div>
            </div>

            <HeroBanner />
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

      {/* Promociones destacadas — solo se renderiza si hay promos con mostrarEnInicio:true */}
      <PromocionesDestacadas />

      {/* Novedades */}
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
            <Link
              href="/zona-de-juegos"
              className="hidden sm:flex items-center gap-1 text-sm text-brand-azul font-semibold hover:gap-2 transition-all"
            >
              Ver todo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Music,
                titulo: 'Show de Personajes',
                desc: 'Todos los sabados y domingos a las 3pm y 6pm',
                badge: 'Gratis',
                color: 'bg-brand-azul/5 border-brand-azul/20',
              },
              {
                icon: Star,
                titulo: 'Semana Tematica',
                desc: 'Actividades especiales cada semana con sorpresas',
                badge: 'Esta semana',
                color: 'bg-brand-rosa/5 border-brand-rosa/20',
              },
              {
                icon: Award,
                titulo: 'Torneo de Juegos',
                desc: 'Compite con otros ninos y gana premios increibles',
                badge: 'Proximo',
                color: 'bg-brand-amarillo/10 border-brand-amarillo/30',
              },
            ].map(({ icon: Icon, titulo, desc, badge, color }) => (
              <div
                key={titulo}
                className={`rounded-2xl border p-5 ${color} hover:shadow-card transition-shadow`}
              >
                <Icon className="h-6 w-6 text-brand-azul mb-3" />
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{titulo}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actividades */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 mb-3">
              Zona de Juegos
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 mb-3">
              Horas de diversion garantizada
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mas de 15 atracciones disenadas para ninos de 1 a 12 anos, con
              supervision constante y medidas de seguridad en cada rincon.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actividades.map(({ icon: Icon, nombre, desc }) => (
              <div
                key={nombre}
                className="bg-white rounded-2xl p-6 hover:shadow-brand transition-all hover:-translate-y-1 border border-gray-100 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center mb-3 group-hover:bg-brand-azul group-hover:text-white transition-colors">
                  <Icon className="h-5 w-5 text-brand-azul group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{nombre}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
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
                Comprar entradas desde S/ 25
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Eventos privados */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20">
                Eventos Privados
              </Badge>
              <h2 className="text-4xl font-black text-gray-900 leading-tight">
                El cumpleanos de tu hijo merece ser{' '}
                <span className="text-brand-rosa">inolvidable</span>
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Organizamos eventos privados exclusivos con decoracion
                personalizada, animacion, catering y todo lo que necesitas para
                crear recuerdos que duran para siempre.
              </p>
              <ul className="space-y-3">
                {[
                  'Hasta 60 invitados',
                  'Decoracion personalizada',
                  'Animacion y shows',
                  'Catering incluido',
                  'Coordinador dedicado',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <CheckCircle className="h-4 w-4 text-brand-menta shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 pt-2">
                <Button
                  asChild
                  className="bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-full font-bold gap-2"
                >
                  <Link href="/eventos">
                    <PartyPopper className="h-4 w-4" />
                    Ver paquetes
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-brand-rosa text-brand-rosa hover:bg-brand-rosa/5"
                >
                  <a href="https://wa.me/51999999999">
                    <Phone className="mr-2 h-4 w-4" />
                    Cotizar por WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {paquetes
                .slice(0, 2)
                .map(
                  ({
                    nombre,
                    icon: Icon,
                    precio,
                    colorGradient,
                    badge,
                    detalles,
                  }) => (
                    <div
                      key={nombre}
                      className={`bg-gradient-to-br ${colorGradient} rounded-2xl p-5 border border-white relative`}
                    >
                      {badge && (
                        <div className="absolute -top-2 -right-2 bg-brand-rosa text-white text-xs font-bold px-2 py-1 rounded-full">
                          {badge}
                        </div>
                      )}
                      <Icon className="h-6 w-6 text-brand-azul mb-2" />
                      <h3 className="font-bold text-gray-900 text-sm">
                        {nombre}
                      </h3>
                      <p className="text-xl font-black text-brand-azul mt-1">
                        {precio}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {detalles.slice(0, 3).map((d) => (
                          <li
                            key={d}
                            className="text-xs text-gray-600 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3 text-brand-menta shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
              <div
                className={`col-span-2 bg-gradient-to-br ${paquetes[2].colorGradient} rounded-2xl p-5 border border-white flex justify-between items-center`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-brand-azul" />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {paquetes[2].nombre}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {paquetes[2].badge}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-brand-azul">
                    {paquetes[2].precio}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="bg-brand-azul text-white rounded-full"
                >
                  <Link href="/eventos">Ver detalles</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seguridad */}
      <section className="py-16 bg-brand-gradient text-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">
              La seguridad de tus hijos, nuestra prioridad
            </h2>
            <p className="text-white/80">
              Cada rincon de Kiki y Lala esta disenado pensando en el bienestar
              de los ninos
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                titulo: 'Supervision constante',
                desc: 'Personal capacitado en cada zona',
              },
              {
                icon: Heart,
                titulo: 'Higiene garantizada',
                desc: 'Desinfeccion despues de cada turno',
              },
              {
                icon: Users,
                titulo: 'Personal certificado',
                desc: 'Entrenados en primeros auxilios',
              },
              {
                icon: Zap,
                titulo: 'Equipos seguros',
                desc: 'Revision diaria de instalaciones',
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

      {/* Testimonios */}
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
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonios.map((t) => (
              <div
                key={t.nombre}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-card transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.estrellas }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-brand-amarillo text-brand-amarillo"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    {t.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
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
            Reserva tu próxima visita o empieza a planificar el cumpleaños
            perfecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-10 h-12 text-base gap-2"
            >
              <Link href="/zona-de-juegos">
                <Ticket className="h-5 w-5" />
                Comprar Entradas
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10 rounded-full px-10 h-12 text-base gap-2"
            >
              <Link href="/eventos">
                <PartyPopper className="h-5 w-5" />
                Planificar Evento
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
