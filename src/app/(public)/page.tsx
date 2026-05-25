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
  PartyPopper,
} from 'lucide-react'
import { HeroBanner } from '@/components/cms/HeroBanner'
import { PromocionesDestacadas } from '@/components/cms/PromocionesDestacadas'
import { SeccionNovedades } from '@/components/public/home/SeccionNovedades'
import { SeccionZonas } from '@/components/public/home/SeccionZonas'
import { SeccionPaquetes } from '@/components/public/home/SeccionPaquetes'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const testimonios = [
  {
    nombre: 'Valeria M.',
    texto: 'El cumpleaños de mi hijo fue mágico. Todo estaba perfecto, los niños no querían irse.',
    estrellas: 5,
  },
  {
    nombre: 'Carlos R.',
    texto: 'Excelente atención, las instalaciones muy limpias y el personal muy amable. Volvemos pronto.',
    estrellas: 5,
  },
  {
    nombre: 'Lucía P.',
    texto: 'Mis hijos adoran Kiki y Lala. Ya es nuestra tradición de fin de semana. Los juegos son seguros y divertidos.',
    estrellas: 5,
  },
]

export default function LandingPage() {
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
            <div className="space-y-8 text-white">
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
                  El espacio donde los niños son los protagonistas. Juegos, celebraciones privadas
                  y momentos que jamás olvidarán, en un ambiente seguro y lleno de alegría.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-8 h-12 text-base gap-2"
                >
                  <Link href="/reservar">
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

              <div className="flex items-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-3xl font-black text-brand-amarillo">+500</div>
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
                  <div className="text-xs text-white/60">Años de experiencia</div>
                </div>
              </div>
            </div>

            <HeroBanner />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      <SeccionNovedades />

      <PromocionesDestacadas />

      <SeccionZonas />

      <SeccionPaquetes />

      <section className="py-16 bg-brand-gradient text-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black mb-2">
              La seguridad de tus hijos, nuestra prioridad
            </h2>
            <p className="text-white/80">
              Cada rincón de Kiki y Lala está diseñado pensando en el bienestar de los niños
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, titulo: 'Supervisión constante', desc: 'Personal capacitado en cada zona' },
              { icon: Heart, titulo: 'Higiene garantizada', desc: 'Desinfección después de cada turno' },
              { icon: Users, titulo: 'Personal certificado', desc: 'Entrenados en primeros auxilios' },
              { icon: Zap, titulo: 'Equipos seguros', desc: 'Revisión diaria de instalaciones' },
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
                    <Star key={i} className="h-4 w-4 fill-brand-amarillo text-brand-amarillo" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  &ldquo;{t.texto}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-gray-900">{t.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-azul/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-rosa/20 rounded-full blur-3xl" />
        </div>
        <div className="container max-w-3xl mx-auto px-4 text-center relative space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto animate-float">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black">¿Listo para la diversión?</h2>
          <p className="text-white/70 text-lg">
            Reserva tu próxima visita o empieza a planificar la celebración perfecta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-brand-rosa hover:bg-brand-rosa/90 text-white font-bold rounded-full px-10 h-12 text-base gap-2"
            >
              <Link href="/reservar">
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
