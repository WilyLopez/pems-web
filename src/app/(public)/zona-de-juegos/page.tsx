// app/(public)/zona-de-juegos/page.tsx

import { Metadata } from 'next'
import Link from 'next/link'
import {
  Ticket,
  Clock,
  Shield,
  AlertCircle,
  ChevronRight,
  Zap,
  Gamepad2,
  Palette,
  Music,
  Baby,
  Camera,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const metadata: Metadata = { title: 'Zona de Juegos | Kiki y Lala' }

const precios = [
  {
    tipo: 'Lunes a Viernes',
    icon: Clock,
    precio: 'S/ 25',
    badge: 'Tarifa regular',
    badgeClass: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
    borderClass: 'border-brand-azul/30 bg-brand-azul/5',
    desc: 'Acceso a todas las zonas de juego por sesion de 90 minutos',
  },
  {
    tipo: 'Fin de Semana',
    icon: Zap,
    precio: 'S/ 35',
    badge: 'Shows incluidos',
    badgeClass: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20',
    borderClass: 'border-brand-rosa/40 bg-brand-rosa/5',
    desc: 'Acceso completo + shows de personajes a las 3pm y 6pm',
  },
  {
    tipo: 'Pack Familiar',
    icon: Users,
    precio: 'S/ 90',
    badge: '3 ninos + 1 gratis',
    badgeClass: 'bg-brand-amarillo/20 text-yellow-700 border-brand-amarillo/30',
    borderClass: 'border-brand-amarillo/40 bg-brand-amarillo/5',
    desc: '4 entradas (3 ninos + 1 adicional gratis). Valido todos los dias',
  },
]

const zonas = [
  {
    icon: Zap,
    nombre: 'Escalada',
    edad: '3 a 12 anos',
    colorClass: 'bg-blue-50 border-blue-200',
  },
  {
    icon: Music,
    nombre: 'Carrusel',
    edad: '1 a 6 anos',
    colorClass: 'bg-pink-50 border-pink-200',
  },
  {
    icon: Baby,
    nombre: 'Piscina de pelotas',
    edad: '1 a 5 anos',
    colorClass: 'bg-purple-50 border-purple-200',
  },
  {
    icon: Gamepad2,
    nombre: 'Arcade',
    edad: '5 a 12 anos',
    colorClass: 'bg-yellow-50 border-yellow-200',
  },
  {
    icon: Palette,
    nombre: 'Arte',
    edad: '3 a 10 anos',
    colorClass: 'bg-green-50 border-green-200',
  },
  {
    icon: Camera,
    nombre: 'Fotobooth',
    edad: 'Todas las edades',
    colorClass: 'bg-orange-50 border-orange-200',
  },
]

const horarios = [
  {
    dia: 'Lunes a Viernes',
    horario: '10:00 am - 8:00 pm',
    turnos: ['10:00 am', '12:30 pm', '3:00 pm', '5:30 pm'],
  },
  {
    dia: 'Sabado',
    horario: '9:00 am - 9:00 pm',
    turnos: ['9:00 am', '11:30 am', '2:00 pm', '4:30 pm', '7:00 pm'],
  },
  {
    dia: 'Domingo y feriados',
    horario: '9:00 am - 8:00 pm',
    turnos: ['9:00 am', '11:30 am', '2:00 pm', '4:30 pm'],
  },
]

const reglas = [
  'Ninos de 1 a 12 anos',
  'Calcetines obligatorios para todos',
  'Prohibido ingresar con comida externa',
  'Adultos deben permanecer en el local',
  'Sin objetos punzantes o peligrosos',
  'Respetar el aforo por zona',
]

export default function ZonaDeJuegosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-brand-azul/10 via-white to-brand-menta/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-azul" />
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
          <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 text-sm px-4 py-1">
            Zona de Juegos
          </Badge>
          <h1 className="text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            El mundo de diversión de{' '}
            <span className="text-brand-azul">Kiki y Lala</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Más de 15 atracciones para niños de 1 a 12 años. Diversión
            garantizada con la seguridad que merece tu familia.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold px-10 gap-2"
          >
            <a href="#comprar">
              <Ticket className="h-5 w-5" />
              Comprar Entradas
            </a>
          </Button>
        </div>
      </section>

      {/* Precios */}
      <section id="comprar" className="py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-2">
              Precios y entradas
            </h2>
            <p className="text-gray-600">
              Elige la entrada que mejor se adapte a tu familia
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {precios.map(
              ({
                tipo,
                icon: Icon,
                precio,
                badge,
                badgeClass,
                borderClass,
                desc,
              }) => (
                <div
                  key={tipo}
                  className={`rounded-3xl border-2 ${borderClass} p-7 flex flex-col gap-4`}
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-brand-azul" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{tipo}</h3>
                    <Badge className={`mt-2 text-xs ${badgeClass}`}>
                      {badge}
                    </Badge>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-brand-azul">
                      {precio}
                    </span>
                    <span className="text-gray-400 mb-1 text-sm">/ nino</span>
                  </div>
                  <p className="text-sm text-gray-600">{desc}</p>
                  <Button
                    asChild
                    className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold mt-auto"
                  >
                    <Link href="/reservar">
                      Comprar ahora
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )
            )}
          </div>

          <div className="mt-8 p-4 bg-brand-amarillo/15 border border-brand-amarillo/30 rounded-2xl flex items-start gap-3">
            <Ticket className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Consejo:</strong> Los tickets comprados en linea tienen
              reserva de horario garantizado. En el local sujeto a
              disponibilidad.
            </p>
          </div>
        </div>
      </section>

      {/* Zonas */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              Nuestras zonas de juego
            </h2>
            <p className="text-gray-600 mt-1">
              Cada zona tiene personal de supervision y equipamiento certificado
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {zonas.map(({ icon: Icon, nombre, edad, colorClass }) => (
              <div
                key={nombre}
                className={`rounded-2xl border ${colorClass} p-5 hover:shadow-card transition-shadow`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-brand-azul" />
                </div>
                <h3 className="font-bold text-gray-900">{nombre}</h3>
                <Badge variant="outline" className="text-xs mt-1">
                  {edad}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horarios */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">
              Horarios y turnos
            </h2>
          </div>
          <div className="space-y-4">
            {horarios.map(({ dia, horario, turnos }) => (
              <div
                key={dia}
                className="rounded-2xl border border-gray-100 p-5 hover:shadow-card transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand-azul" />
                    <span className="font-bold text-gray-900">{dia}</span>
                  </div>
                  <span className="text-sm text-brand-azul font-semibold">
                    {horario}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {turnos.map((t) => (
                    <Badge
                      key={t}
                      variant="outline"
                      className="text-xs border-brand-azul/30 text-brand-azul"
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reglamento */}
      <section className="py-16 bg-brand-rosa/5">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Shield className="h-8 w-8 text-brand-rosa mx-auto mb-2" />
            <h2 className="text-3xl font-black text-gray-900">
              Reglamento del local
            </h2>
            <p className="text-gray-600 mt-1">
              Para garantizar la seguridad y diversion de todos los ninos
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reglas.map((r) => (
              <div
                key={r}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-brand-rosa/10"
              >
                <AlertCircle className="h-4 w-4 text-brand-rosa shrink-0" />
                <span className="text-sm font-medium text-gray-700">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-azul text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
          <Gamepad2 className="h-12 w-12 mx-auto text-white/80" />
          <h2 className="text-3xl font-black">Listo para jugar?</h2>
          <p className="text-white/80">
            Compra tu entrada online y garantiza tu ingreso.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-azul hover:bg-white/90 rounded-full font-bold px-10 gap-2"
          >
            <Link href="/reservar">
              <Ticket className="h-5 w-5" />
              Comprar Entradas
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
