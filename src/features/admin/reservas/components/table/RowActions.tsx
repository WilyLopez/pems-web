import React from 'react'
import {
  Eye,
  LogIn,
  XCircle,
  AlertTriangle,
  Banknote,
  Download,
  Loader2,
  Trash2,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Reserva } from '../../types'
import { reservaHelpers } from '../../utils/reserva-helpers'
import { reservasApi } from '../../services/reservas.api'
import { toast } from 'sonner'
import { isBefore, parseISO, startOfDay } from 'date-fns'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

interface RowActionsProps {
  reserva: Reserva
  onView: (id: number) => void
  onAction: (modal: string, id: number) => void
}

export const RowActions = React.memo(
  ({ reserva, onView, onAction }: RowActionsProps) => {
    const [descargando, setDescargando] = React.useState(false)
    const cancelable = reservaHelpers.canCancel(reserva)
    const esYapePendiente = reservaHelpers.needsYapeValidation(reserva)
    const necesitaCobro = reservaHelpers.needsCobro(reserva)

    const fechaPasada = React.useMemo(() => {
      const dateLimit = startOfDay(parseISO(reserva.fechaEvento))
      const today = startOfDay(new Date())
      return isBefore(dateLimit, today)
    }, [reserva.fechaEvento])

    const esEstadoValido = reserva.estado === 'CONFIRMADA'
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
          className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul hover:bg-brand-azul/5 shrink-0"
          title="Ver detalles"
          onClick={() => onView(reserva.id)}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 shrink-0"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl min-w-[150px]">
            {reserva.ventaId !== null && !reserva.ingresado && reserva.estado === 'CONFIRMADA' && (
              <DropdownMenuItem
                disabled={deshabilitarIngreso}
                onClick={() => onAction('ingreso', reserva.id)}
                className="text-gray-700 focus:text-green-600 focus:bg-green-50 rounded-lg cursor-pointer"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Registrar ingreso
              </DropdownMenuItem>
            )}


            {esYapePendiente && (
              <DropdownMenuItem
                onClick={() => onAction('validar-yape', reserva.id)}
                className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 rounded-lg cursor-pointer"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Validar Yape
              </DropdownMenuItem>
            )}

            {necesitaCobro && (
              <DropdownMenuItem
                onClick={() => onAction('cobrar', reserva.id)}
                className="text-brand-azul focus:text-brand-azul focus:bg-brand-azul/5 rounded-lg cursor-pointer"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Cobrar
              </DropdownMenuItem>
            )}

            {reserva.ventaId !== null && (
              <DropdownMenuItem
                disabled={descargando}
                onClick={handleDescargarTicket}
                className="text-gray-700 focus:text-brand-azul focus:bg-brand-azul/5 rounded-lg cursor-pointer"
              >
                {descargando ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Descargar ticket
              </DropdownMenuItem>
            )}

            {(cancelable || true) && (
              <>
                <DropdownMenuSeparator />
                {cancelable && (
                  <DropdownMenuItem
                    onClick={() => onAction('cancelar', reserva.id)}
                    className="text-destructive focus:text-destructive focus:bg-red-50 rounded-lg cursor-pointer"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onAction('eliminar', reserva.id)}
                  className="text-destructive focus:text-destructive focus:bg-red-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }
)

RowActions.displayName = 'RowActions'
