import React from 'react'
import { Eye, LogIn, XCircle, AlertTriangle, Banknote, Download, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reserva } from '../../types'
import { reservaHelpers } from '../../utils/reserva-helpers'
import { reservasApi } from '../../services/reservas.api'
import { toast } from 'sonner'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

interface RowActionsProps {
  reserva: Reserva
  onView: (id: number) => void
  onAction: (modal: string, id: number) => void
}

export const RowActions = React.memo(({ reserva, onView, onAction }: RowActionsProps) => {
  const [descargando, setDescargando] = React.useState(false)
  const cancelable = reservaHelpers.canCancel(reserva)
  const esYapePendiente = reservaHelpers.needsYapeValidation(reserva)
  const necesitaCobro = reservaHelpers.needsCobro(reserva)

  const fechaPasada = React.useMemo(() => {
    const dateLimit = startOfDay(parseISO(reserva.fechaEvento))
    const today = startOfDay(new Date())
    return isBefore(dateLimit, today)
  }, [reserva.fechaEvento])

  const esEstadoValido = ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado)
  const deshabilitarIngreso = fechaPasada || !esEstadoValido

  const handleDescargarTicket = async () => {
    setDescargando(true)
    try {
      await reservasApi.descargarTicket(reserva.id, reserva.numeroTicket)
      toast.success('Ticket descargado')
    } catch (err) {
      toast.error('No se pudo descargar el ticket')
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul hover:bg-brand-azul/5"
        title="Ver detalles"
        onClick={() => onView(reserva.id)}
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>

      {necesitaCobro && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-lg text-brand-azul hover:text-brand-azul hover:bg-brand-azul/10"
          title="Cobrar reserva"
          onClick={() => onAction('cobrar', reserva.id)}
        >
          <Banknote className="h-3.5 w-3.5" />
        </Button>
      )}

      {reserva.ventaId !== null && (
        <Button
          variant="ghost"
          size="icon"
          disabled={descargando}
          className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul hover:bg-brand-azul/5"
          title="Descargar ticket"
          onClick={handleDescargarTicket}
        >
          {descargando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        </Button>
      )}

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

      {reserva.ventaId !== null && !reserva.ingresado && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                variant="ghost"
                size="icon"
                disabled={deshabilitarIngreso}
                className={cn(
                  'h-7 w-7 rounded-lg transition-colors',
                  deshabilitarIngreso
                    ? 'text-gray-300 hover:text-gray-300 hover:bg-transparent cursor-not-allowed'
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                )}
                onClick={() => !deshabilitarIngreso && onAction('ingreso', reserva.id)}
              >
                <LogIn className="h-3.5 w-3.5" />
              </Button>
            </span>
          </TooltipTrigger>
          {deshabilitarIngreso && (
            <TooltipContent side="top">
              {fechaPasada
                ? 'No se puede registrar el ingreso: la fecha del evento ya pasó'
                : 'No se puede registrar el ingreso: el estado de la reserva no es válido'}
            </TooltipContent>
          )}
        </Tooltip>
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

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-lg text-gray-400 hover:text-destructive hover:bg-red-50"
        title="Eliminar reserva"
        onClick={() => onAction('eliminar', reserva.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
})

RowActions.displayName = 'RowActions'
