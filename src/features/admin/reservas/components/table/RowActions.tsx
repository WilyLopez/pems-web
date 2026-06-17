import React from 'react'
import { Eye, LogIn, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reserva } from '../../types'
import { reservaHelpers } from '../../utils/reserva-helpers'

interface RowActionsProps {
  reserva: Reserva
  onView: (id: number) => void
  onAction: (modal: string, id: number) => void
}

export const RowActions = React.memo(({ reserva, onView, onAction }: RowActionsProps) => {
  const cancelable = reservaHelpers.canCancel(reserva)
  const puedeIngreso = reservaHelpers.canEnter(reserva)
  const esYapePendiente = reservaHelpers.needsYapeValidation(reserva)

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul hover:bg-brand-azul/5"
        onClick={() => onView(reserva.id)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      {esYapePendiente && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-50"
          title="Validar pago Yape"
          onClick={() => onAction('validar-yape', reserva.id)}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
        </Button>
      )}

      {puedeIngreso && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50"
          title="Marcar ingreso"
          onClick={() => onAction('ingreso', reserva.id)}
        >
          <LogIn className="h-3.5 w-3.5" />
        </Button>
      )}

      {cancelable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-gray-400 hover:text-destructive hover:bg-red-50"
          title="Cancelar reserva"
          onClick={() => onAction('cancelar', reserva.id)}
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
})

RowActions.displayName = 'RowActions'
