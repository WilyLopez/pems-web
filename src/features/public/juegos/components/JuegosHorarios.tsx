import { Clock } from 'lucide-react'
import { useHorarioAtencion } from '@/features/public/shared/hooks/useHorarioAtencion'

export function JuegosHorarios() {
  const { horarioSemana, horarioFinDeSemana } = useHorarioAtencion()

  const horarios = [
    { dia: 'Lunes a Viernes', horario: horarioSemana ?? '10:00 am – 8:00 pm' },
    {
      dia: 'Fin de semana y feriados',
      horario: horarioFinDeSemana ?? '9:00 am – 9:00 pm',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Horarios</h2>
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
              <span className="text-sm text-brand-azul font-semibold">
                {horario}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
