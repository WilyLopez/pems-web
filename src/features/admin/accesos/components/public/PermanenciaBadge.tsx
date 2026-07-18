import { Clock, TimerOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PermanenciaBadgeProps {
  permanenciaVigente: boolean
  permanenciaFinAt?: string
}

export function PermanenciaBadge({
  permanenciaVigente,
  permanenciaFinAt,
}: PermanenciaBadgeProps) {
  if (!permanenciaFinAt) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
        <Clock className="h-4 w-4 text-blue-600 shrink-0" />
        <p className="text-sm font-medium text-blue-800">
          Ingreso registrado, permanencia todo el día.
        </p>
      </div>
    )
  }

  const horaLimite = formatDate(permanenciaFinAt, 'HH:mm')

  if (permanenciaVigente) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
        <Clock className="h-4 w-4 text-green-600 shrink-0" />
        <p className="text-sm font-medium text-green-800">
          Reingreso permitido, hasta las {horaLimite}.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <TimerOff className="h-4 w-4 text-red-600 shrink-0" />
      <p className="text-sm font-medium text-red-800">
        Permanencia vencida a las {horaLimite}.
      </p>
    </div>
  )
}
