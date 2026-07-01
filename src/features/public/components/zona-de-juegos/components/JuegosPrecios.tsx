import Link from 'next/link'
import { Clock, Zap, Ticket, ChevronRight, LucideIcon } from 'lucide-react'
import { Button } from '../../../../../components/ui/Button'
import { Badge } from '../../../../../components/ui/Badge'
import { usePublicPrecios } from '../../../hooks/usePublicPrecios'

interface Tarifa {
  tipo: string
  icon: LucideIcon
  precio: string
  badge: string
  badgeClass: string
  borderClass: string
  desc: string
}

export function JuegosPrecios() {
  const { data: preciosData } = usePublicPrecios(1)

  const precioSemana = preciosData?.find((p) => p.tipoDia === 'SEMANA')?.precio
  const precioFds = preciosData?.find((p) => p.tipoDia === 'FIN_SEMANA_FERIADO')?.precio

  const precios: Tarifa[] = [
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
      desc: 'Acceso a todas las zonas de juego por sesión de 2 horas',
    },
  ]

  return (
    <section id="comprar" className="py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">
            Precios y entradas
          </h2>
          <p className="text-gray-600">
            Elige la entrada que mejor se adapte a tu familia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
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
                className={`rounded-3xl border-2 ${borderClass} p-7 flex flex-col gap-4 shadow-sm hover:scale-102 transition-transform`}
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
                  <span className="text-gray-400 mb-1 text-sm">/ niño</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {desc}
                </p>
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
            )
          )}
        </div>

        <div className="mt-8 p-4 bg-brand-amarillo/15 border border-brand-amarillo/30 rounded-2xl flex items-start gap-3">
          <Ticket className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Consejo:</strong> Los tickets comprados en línea tienen
            reserva de horario garantizado. En el local sujeto a
            disponibilidad.
          </p>
        </div>
      </div>
    </section>
  )
}
