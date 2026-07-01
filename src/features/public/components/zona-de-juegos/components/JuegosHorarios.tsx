import { Clock } from 'lucide-react'
import { ConfiguracionPublica } from '../../../../../types/configuracion-publica.types'
import { useSedesPublicas } from '@/features/public/hooks/useSedesPublicas'
import { useConfiguracionCalendarioPublica } from '@/hooks/useCalendario'

interface JuegosHorariosProps {
  config: ConfiguracionPublica | undefined
}

function formatTime12h(timeStr: string | undefined): string {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1]
  if (isNaN(hours)) return timeStr
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  if (hours === 0) hours = 12
  return `${hours}:${minutes} ${ampm}`
}

export function JuegosHorarios({ config }: JuegosHorariosProps) {
  const { idSedeUnica, sedes } = useSedesPublicas()
  const idSede = idSedeUnica ?? sedes[0]?.id ?? 0
  const { data: configPublica } = useConfiguracionCalendarioPublica(idSede)

  const diasSet = new Set(
    (configPublica?.diasOperacion ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )

  const tieneSemana = ['1', '2', '3', '4', '5'].some((d) => diasSet.has(d))
  const tieneFinSemana = ['6', '7'].some((d) => diasSet.has(d))

  const horaAperturaFormatted = formatTime12h(configPublica?.horaApertura)
  const horaCierreFormatted = formatTime12h(configPublica?.horaCierre)

  const horarioSemana = configPublica
    ? tieneSemana
      ? `${horaAperturaFormatted} – ${horaCierreFormatted}`
      : 'Cerrado'
    : (config?.horarioSemana ?? '10:00 am – 8:00 pm')

  const horarioFinDeSemana = configPublica
    ? tieneFinSemana
      ? `${horaAperturaFormatted} – ${horaCierreFormatted}`
      : 'Cerrado'
    : (config?.horarioFinDeSemana ?? '9:00 am – 9:00 pm')

  const horarios = [
    { dia: 'Lunes a Viernes', horario: horarioSemana },
    { dia: 'Fin de semana y feriados', horario: horarioFinDeSemana },
  ]

  return (
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
