import { Users, Award, Star, Heart, LucideIcon } from 'lucide-react'
import { Badge } from '../../../../../components/ui/Badge'

interface Metricas {
  familiasFelices: string
  eventosRealizados: string
  aniosExperiencia: string
  calificacionPromedio: string
}

interface NosotrosHistoriaProps {
  metricas: Metricas
}

interface MetricaCardProps {
  icon: LucideIcon
  value: string
  label: string
  bgClass: string
}

function MetricaCard({ icon: Icon, value, label, bgClass }: MetricaCardProps) {
  return (
    <div className={`${bgClass} rounded-2xl p-6 text-center shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300`}>
      <Icon className="h-6 w-6 text-brand-azul mx-auto mb-2" />
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <div className="text-xs text-gray-650 mt-1 font-semibold">{label}</div>
    </div>
  )
}

export function NosotrosHistoria({ metricas }: NosotrosHistoriaProps) {
  const metricasList = [
    {
      icon: Users,
      value: metricas.familiasFelices,
      label: 'Familias atendidas',
      bgClass: 'bg-brand-azul/10',
    },
    {
      icon: Award,
      value: metricas.eventosRealizados,
      label: 'Eventos realizados',
      bgClass: 'bg-brand-rosa/10',
    },
    {
      icon: Star,
      value: metricas.aniosExperiencia,
      label: 'Años de experiencia',
      bgClass: 'bg-brand-amarillo/15',
    },
    {
      icon: Heart,
      value: metricas.calificacionPromedio,
      label: 'Calificación promedio',
      bgClass: 'bg-brand-menta/20',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20">
              Nuestra historia
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Nacimos de un sueño familiar
            </h2>
            <div className="space-y-4 text-gray-650 leading-relaxed">
              <p>
                Kiki y Lala nació con una misión clara: crear un espacio donde
                los niños pudieran ser completamente libres de jugar, reír y
                descubrir el mundo de una manera segura y divertida.
              </p>
              <p>
                Lo que comenzó como un pequeño local con pocas atracciones,
                hoy es uno de los centros de entretenimiento infantil más
                queridos de Chiclayo, con más de 15 zonas de juego y cientos
                de eventos realizados.
              </p>
              <p>
                Nuestros personajes Kiki y Lala representan la amistad, la
                diversión y la magia de la infancia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {metricasList.map((metrica) => (
              <MetricaCard key={metrica.label} {...metrica} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
