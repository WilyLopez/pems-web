import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Clock, Zap, ChevronRight } from 'lucide-react'

interface VistaPreviaProps {
  precioSemana: number | null
  precioFinDeSemana: number | null
  duracionSemana?: number
  duracionFinDeSemana?: number
}

function descripcionPermanencia(duracionMinutos?: number): string {
  if (!duracionMinutos)
    return 'Acceso ilimitado a todas las zonas de juego durante todo el día'
  if (duracionMinutos % 60 === 0)
    return `Acceso a todas las zonas de juego por sesión de ${duracionMinutos / 60} hora${duracionMinutos === 60 ? '' : 's'}`
  return `Acceso a todas las zonas de juego por sesión de ${duracionMinutos} minutos`
}

export function VistaPrevia({
  precioSemana,
  precioFinDeSemana,
  duracionSemana,
  duracionFinDeSemana,
}: VistaPreviaProps) {
  const precios = [
    {
      tipo: 'Lunes a Viernes',
      icon: Clock,
      precio:
        precioSemana != null
          ? `S/ ${precioSemana.toFixed(2)}`
          : 'Sin configurar',
      badge: 'Tarifa regular',
      badgeClass:
        'bg-brand-azul/10 text-brand-azul border-brand-azul/20 hover:bg-brand-azul/10',
      borderClass: 'border-brand-azul/30 bg-brand-azul/5',
      desc: descripcionPermanencia(duracionSemana),
      iconColor: 'text-brand-azul',
    },
    {
      tipo: 'Fines de Semana y Feriados',
      icon: Zap,
      precio:
        precioFinDeSemana != null
          ? `S/ ${precioFinDeSemana.toFixed(2)}`
          : 'Sin configurar',
      badge: undefined,
      badgeClass: '',
      borderClass: 'border-brand-rosa/40 bg-brand-rosa/5',
      desc: descripcionPermanencia(duracionFinDeSemana),
      iconColor: 'text-brand-rosa',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-gray-900">
            Vista previa del sitio público
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Así es como los clientes verán las tarifas de tu sede en la página
            web.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 mt-6">
          {precios.map(
            ({
              tipo,
              icon: Icon,
              precio,
              badge,
              badgeClass,
              borderClass,
              desc,
              iconColor,
            }) => (
              <div
                key={tipo}
                className={`rounded-3xl border-2 ${borderClass} p-6 flex flex-col gap-4 shadow-sm`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3 border border-gray-100/50">
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <h4 className="text-lg font-black text-gray-900">{tipo}</h4>
                  {badge && (
                    <Badge
                      variant="outline"
                      className={`mt-2 text-xs font-semibold ${badgeClass}`}
                    >
                      {badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-gray-900">
                    {precio}
                  </span>
                  {precio !== 'Sin configurar' && (
                    <span className="text-gray-400 mb-1 text-xs">/ niño</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
                <Button
                  disabled
                  className="w-full bg-brand-azul hover:bg-brand-azul/90 text-white rounded-full font-bold mt-auto text-xs h-9 cursor-default"
                >
                  Comprar ahora
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
