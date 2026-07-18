import Link from 'next/link'
import { Clock, Zap, Ticket, ChevronRight, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { usePublicPrecios } from '@/features/public/shared/hooks/usePublicPrecios'
import { useSedesPublicas } from '@/features/public/shared/hooks/useSedesPublicas'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'
import { SocialProofStrip } from '@/features/public/shared/components/SocialProofStrip'

interface Tarifa {
  tipo: string
  icon: LucideIcon
  precio: string
  badge?: string
  badgeClass: string
  borderClass: string
  desc: string
}

function descripcionPermanencia(duracionMinutos?: number | null): string {
  if (!duracionMinutos)
    return 'Acceso ilimitado a todas las zonas de juego durante todo el día'
  if (duracionMinutos % 60 === 0)
    return `Acceso a todas las zonas de juego por sesión de ${duracionMinutos / 60} hora${duracionMinutos === 60 ? '' : 's'}`
  return `Acceso a todas las zonas de juego por sesión de ${duracionMinutos} minutos`
}

export function JuegosPrecios() {
  const { idSedeActiva } = useSedesPublicas()
  const { data: preciosData } = usePublicPrecios(idSedeActiva ?? 0)

  const tarifaSemana = preciosData?.find((p) => p.tipoDia === 'SEMANA')
  const tarifaFds = preciosData?.find(
    (p) => p.tipoDia === 'FIN_SEMANA_FERIADO'
  )

  const precios: Tarifa[] = [
    {
      tipo: 'Lunes a Viernes',
      icon: Clock,
      precio:
        tarifaSemana != null
          ? `S/ ${Number(tarifaSemana.precio).toFixed(2)}`
          : 'S/ 25',
      badge: 'Tarifa regular',
      badgeClass: 'bg-brand-azul/10 text-brand-azul border-brand-azul/20',
      borderClass: 'border-brand-azul/30 bg-brand-azul/5',
      desc: descripcionPermanencia(tarifaSemana?.duracionMinutos),
    },
    {
      tipo: 'Fines de Semana y Feriados',
      icon: Zap,
      precio:
        tarifaFds != null ? `S/ ${Number(tarifaFds.precio).toFixed(2)}` : 'S/ 35',
      badgeClass: 'bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20',
      borderClass: 'border-brand-rosa/40 bg-brand-rosa/5',
      desc: descripcionPermanencia(tarifaFds?.duracionMinutos),
    },
  ]

  return (
    <section id="comprar" className="scroll-mt-20 py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <SectionHeader
          title="Precios y entradas"
          titleClassName="sm:text-4xl"
          description="Elige la entrada que mejor se adapte a tu familia"
          className="mb-12"
        />

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
                className={`rounded-3xl border-2 ${borderClass} p-7 flex flex-col gap-4 shadow-sm hover:scale-105 transition-transform`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-brand-azul" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{tipo}</h3>
                  {badge && (
                    <Badge className={`mt-2 text-xs ${badgeClass}`}>
                      {badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-black text-brand-azul-dark">
                    {precio}
                  </span>
                  <span className="text-gray-400 mb-1 text-sm">/ niño</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                <Button asChild variant="brand" className="w-full mt-auto">
                  <Link href="/cliente/reservar">
                    Comprar ahora
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )
          )}
        </div>

        <SocialProofStrip className="mt-8 max-w-3xl mx-auto" />

        <div className="mt-8 p-4 bg-brand-amarillo/15 border border-brand-amarillo/30 rounded-2xl flex items-start gap-3">
          <Ticket className="h-5 w-5 text-yellow-700 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Consejo:</strong> Los tickets comprados en línea tienen
            reserva de horario garantizado. En el local sujeto a disponibilidad.
          </p>
        </div>
      </div>
    </section>
  )
}
