import { Star, CalendarDays, Check, PartyPopper } from 'lucide-react'
import { SectionHeader } from '@/features/public/shared/components/SectionHeader'

const pasosPorDefecto = [
  {
    n: '1',
    icon: Star,
    titulo: 'Elige el paquete',
    desc: 'Selecciona el que mejor se adapte',
  },
  {
    n: '2',
    icon: CalendarDays,
    titulo: 'Elige fecha y turno',
    desc: 'Verifica disponibilidad',
  },
  {
    n: '3',
    icon: Check,
    titulo: 'Paga el adelanto',
    desc: 'Confirma con un adelanto del 30%',
  },
  {
    n: '4',
    icon: PartyPopper,
    titulo: 'A celebrar',
    desc: 'Nosotros nos encargamos del resto',
  },
]

export function Pasos() {
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <SectionHeader title="¿Cómo reservar tu celebración?" className="mb-10" />
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {pasosPorDefecto.map(({ n, icon: Icon, titulo, desc }) => (
            <div key={n} className="relative">
              <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                {n}
              </div>
              <Icon className="h-5 w-5 text-brand-azul mx-auto mb-1" />
              <h3 className="font-bold text-sm text-gray-900">{titulo}</h3>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
