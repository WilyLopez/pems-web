import { Shield, Heart, Star, LucideIcon } from 'lucide-react'

interface ValorCardProps {
  icon: LucideIcon
  titulo: string
  desc: string
  iconColor: string
  iconBg: string
}

function ValorCard({ icon: Icon, titulo, desc, iconColor, iconBg }: ValorCardProps) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

export function NosotrosValores() {
  const valores = [
    {
      icon: Shield,
      titulo: 'Seguridad primero',
      desc: 'Todas nuestras instalaciones cumplen estrictos estándares de seguridad. Revisión diaria de equipos y supervisión constante del personal.',
      iconColor: 'text-brand-azul',
      iconBg: 'bg-brand-azul/10',
    },
    {
      icon: Heart,
      titulo: 'Amor por los niños',
      desc: 'Cada detalle del local está pensado para que los niños se sientan felices, libres y especiales. Su sonrisa es nuestra mayor recompensa.',
      iconColor: 'text-brand-rosa',
      iconBg: 'bg-brand-rosa/10',
    },
    {
      icon: Star,
      titulo: 'Excelencia en servicio',
      desc: 'Nos comprometemos a superar las expectativas en cada visita. Personal capacitado, instalaciones limpias y atención personalizada.',
      iconColor: 'text-yellow-600',
      iconBg: 'bg-brand-amarillo/15',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900">
            Nuestros valores
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {valores.map((valor) => (
            <ValorCard key={valor.titulo} {...valor} />
          ))}
        </div>
      </div>
    </section>
  )
}
