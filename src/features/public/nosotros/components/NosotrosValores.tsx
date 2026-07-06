'use client'

import { Shield, Heart, Star, Sparkles, LucideIcon } from 'lucide-react'
import { useContenidoPublico } from '@/features/public/shared/hooks/useContenidoPublico'

interface Valor {
  titulo: string
  descripcion: string
}

const VALORES_DEFECTO: Valor[] = [
  {
    titulo: 'Seguridad primero',
    descripcion:
      'Todas nuestras instalaciones cumplen estrictos estándares de seguridad. Revisión diaria de equipos y supervisión constante del personal.',
  },
  {
    titulo: 'Amor por los niños',
    descripcion:
      'Cada detalle del local está pensado para que los niños se sientan felices, libres y especiales. Su sonrisa es nuestra mayor recompensa.',
  },
  {
    titulo: 'Excelencia en servicio',
    descripcion:
      'Nos comprometemos a superar las expectativas en cada visita. Personal capacitado, instalaciones limpias y atención personalizada.',
  },
]

const ESTILOS = [
  { icon: Shield, iconColor: 'text-brand-azul', iconBg: 'bg-brand-azul/10' },
  { icon: Heart, iconColor: 'text-brand-rosa', iconBg: 'bg-brand-rosa/10' },
  { icon: Star, iconColor: 'text-yellow-600', iconBg: 'bg-brand-amarillo/15' },
  {
    icon: Sparkles,
    iconColor: 'text-brand-menta',
    iconBg: 'bg-brand-menta/20',
  },
]

function parseValores(json: string): Valor[] {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      const items = parsed
        .filter((v) => v && typeof v.titulo === 'string')
        .map((v) => ({
          titulo: String(v.titulo ?? ''),
          descripcion: String(v.descripcion ?? ''),
        }))
      if (items.length > 0) return items
    }
  } catch {}
  return VALORES_DEFECTO
}

interface ValorCardProps {
  icon: LucideIcon
  titulo: string
  desc: string
  iconColor: string
  iconBg: string
}

function ValorCard({
  icon: Icon,
  titulo,
  desc,
  iconColor,
  iconBg,
}: ValorCardProps) {
  return (
    <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
      <div
        className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-4`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}

export function NosotrosValores() {
  const { texto } = useContenidoPublico()
  const valores = parseValores(texto('nosotros.valores.items', ''))

  return (
    <section className="py-16 bg-gray-50">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            {texto('nosotros.valores.titulo', 'Nuestros valores')}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {valores.map((valor, i) => {
            const estilo = ESTILOS[i % ESTILOS.length]
            return (
              <ValorCard
                key={i}
                icon={estilo.icon}
                titulo={valor.titulo}
                desc={valor.descripcion}
                iconColor={estilo.iconColor}
                iconBg={estilo.iconBg}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
