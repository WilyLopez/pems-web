'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Ticket,
  Clock,
  Shield,
  AlertCircle,
  ChevronRight,
  Zap,
  Gamepad2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useZonas } from '../../hooks/useZonas'
import { usePublicConfig } from '../../hooks/usePublicConfig'
import { usePublicPrecios } from '../../hooks/usePublicPrecios'
import { Skeleton } from '../shared/Skeletons'
import { fileUrl } from '@/lib/utils'

export function ZonaDeJuegosView() {
  const { data: zonas, isLoading: loadingZonas } = useZonas()
  const { data: config, isLoading: loadingConfig } = usePublicConfig()
  const { data: preciosData, isLoading: loadingPrecios } = usePublicPrecios(1)

  const precioSemana = preciosData?.find((p) => p.tipoDia === 'SEMANA')?.precio
  const precioFds = preciosData?.find((p) => p.tipoDia === 'FIN_SEMANA_FERIADO')?.precio

  const precios = [
    {
      tipo: 'Lunes a Viernes',
      icon: Clock,
      precio: precioSemana != null ? `S/ ${Number(precioSemana).toFixed(2)}` : 'S/ 25',
      badge: 'Tarifa regular',
      badgeClass: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
      borderClass: 'border-brand-azul/30 bg-brand-azul/5',
      desc: 'Acceso ilimitado a todas las zonas de juego durante todo el día',
    },
    {
      tipo: 'Fin de Semana',
      icon: Zap,
      precio: precioFds != null ? `S/ ${Number(precioFds).toFixed(2)}` : 'S/ 35',
      badge: 'Shows incluidos',
      badgeClass: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20',
      borderClass: 'border-brand-rosa/40 bg-brand-rosa/5',
      desc: 'Acceso a todas las zonas de juego por sesión de 2 horas ',
    },
  ]

  const horarioSemana = config?.horarioSemana ?? 'Lun–Vie: 10:00 am – 8:00 pm'
  const horarioFinDeSemana = config?.horarioFinDeSemana ?? 'Sáb–Dom: 9:00 am – 9:00 pm'

  const horarios = [
    { dia: 'Lunes a Viernes', horario: horarioSemana },
    { dia: 'Fin de semana y feriados', horario: horarioFinDeSemana },
  ]

  // Mapear reglas locales dinámicas desde JSONB
  let reglasList = [
    'Niños de 1 a 12 años',
    'Calcetines obligatorios para todos',
    'Prohibido ingresar con comida externa',
    'Adultos deben permanecer en el local',
    'Sin objetos punzantes o peligrosos',
    'Respetar el aforo por zona',
  ]

  if (config?.reglasLocal) {
    try {
      const parsed = JSON.parse(config.reglasLocal)
      if (Array.isArray(parsed)) {
        reglasList = parsed
      } else if (parsed.normas && Array.isArray(parsed.normas)) {
        reglasList = parsed.normas
      }
    } catch {
      // Ignorar errores y usar defaults
    }
  }

  return (
    <>
      <section className="relative pt-24 pb-16 bg-gradient-to-br from-brand-azul/10 via-white to-brand-menta/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-azul" />
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-5">
          <Badge className="bg-brand-azul/10 text-brand-azul border-brand-azul/20 text-sm px-4 py-1">
            Zona de Juegos
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 max-w-3xl mx-auto leading-tight">
            El mundo de diversión de{' '}
            <span className="text-brand-azul">Kiki y Lala</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Atracciones para niños de 1 a 12 años. Diversión garantizada
            con la seguridad que merece tu familia.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold px-10 gap-2"
          >
            <a href="#comprar">
              <Ticket className="h-5 w-5" />
              Ver entradas
            </a>
          </Button>
        </div>
      </section>

      <section id="comprar" className="py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Precios y entradas</h2>
            <p className="text-gray-600">Elige la entrada que mejor se adapte a tu familia</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
            {precios.map(({ tipo, icon: Icon, precio, badge, badgeClass, borderClass, desc }) => (
              <div key={tipo} className={`rounded-3xl border-2 ${borderClass} p-7 flex flex-col gap-4 shadow-sm hover:scale-102 transition-transform`}>
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-brand-azul" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">{tipo}</h3>
                  <Badge className={`mt-2 text-xs ${badgeClass}`}>{badge}</Badge>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-brand-azul">{precio}</span>
                  <span className="text-gray-400 mb-1 text-sm">/ niño</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                <Button
                  asChild
                  className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold mt-auto"
                >
                  <Link href="/cliente/reservar">
                    Comprar ahora
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-brand-amarillo/15 border border-brand-amarillo/30 rounded-2xl flex items-start gap-3">
            <Ticket className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              <strong>Consejo:</strong> Los tickets comprados en línea tienen reserva de horario
              garantizado. En el local sujeto a disponibilidad.
            </p>
          </div>
        </div>
      </section>

      {loadingZonas ? (
        <section className="py-16 bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4 space-y-6">
            <Skeleton className="h-10 w-48 mx-auto" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl bg-gray-200" />
              ))}
            </div>
          </div>
        </section>
      ) : zonas && zonas.length > 0 ? (
        <section className="py-16 bg-gray-50">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900">Nuestras zonas de juego</h2>
              <p className="text-gray-600 mt-1">
                Cada zona tiene personal de supervisión y equipamiento certificado
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {zonas.map((zona) => {
                const imagen = zona.imagenes[0]
                const edades =
                  zona.edadMinima != null && zona.edadMaxima != null
                    ? `${zona.edadMinima}–${zona.edadMaxima} años`
                    : zona.edadMinima != null
                      ? `Desde ${zona.edadMinima} años`
                      : 'Todas las edades'

                return (
                  <div
                    key={zona.id}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-card transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
                  >
                    <div>
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
                            <Gamepad2 className="h-10 w-10 text-brand-azul/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900">{zona.nombre}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-relaxed">{zona.descripcion}</p>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-0">
                      <Badge variant="outline" className="text-xs border-brand-azul/30 text-brand-azul">
                        {edades}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">Horarios</h2>
          </div>
          <div className="space-y-4">
            {horarios.map(({ dia, horario }) => (
              <div
                key={dia}
                className="rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand-azul" />
                  <span className="font-bold text-gray-900">{dia}</span>
                </div>
                <span className="text-sm text-brand-azul font-semibold">{horario}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-rosa/5">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Shield className="h-8 w-8 text-brand-rosa mx-auto mb-2" />
            <h2 className="text-3xl font-black text-gray-900">Reglamento del local</h2>
            <p className="text-gray-600 mt-1">
              Para garantizar la seguridad y diversión de todos los niños
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {reglasList.map((r) => (
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

      <section className="py-16 bg-brand-azul text-white">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-5">
          <Gamepad2 className="h-12 w-12 mx-auto text-white/80" />
          <h2 className="text-3xl font-black">¿Listo para jugar?</h2>
          <p className="text-white/80">Compra tu entrada en línea y garantiza tu ingreso.</p>
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-azul hover:bg-white/90 rounded-full font-bold px-10 gap-2"
          >
            <Link href="/cliente/reservar">
              <Ticket className="h-5 w-5" />
              Reservar ahora
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
