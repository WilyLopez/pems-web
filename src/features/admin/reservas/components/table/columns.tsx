import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'
import { Reserva } from '../../types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { ReservaStatusBadge } from '../shared/ReservaStatusBadge'
import { RowActions } from './RowActions'
import { cn } from '@/lib/utils'

interface GetColumnsProps {
  onView: (id: number) => void
  onAction: (modal: string, id: number) => void
}

export const getColumns = ({
  onView,
  onAction,
}: GetColumnsProps): ColumnDef<Reserva>[] => [
  {
    accessorKey: 'numeroTicket',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">Ticket</span>
    ),
    cell: ({ row }) => {
      const ticket = row.original.numeroTicket
      const parts = ticket.split('-')
      const ticketCorto = parts.length >= 4 ? `${parts[0]}-${parts[1]}-...-${parts[3]}` : ticket
      return (
        <span
          title={ticket}
          className="font-mono text-[11px] font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg whitespace-nowrap inline-block cursor-help"
        >
          {ticketCorto}
        </span>
      )
    },
  },
  {
    accessorKey: 'fechaEvento',
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase hover:text-brand-azul transition-colors"
      >
        Fecha <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-700">
          {formatDate(row.original.fechaEvento)}
        </span>
        <span className="text-[10px] text-gray-400 font-medium">
          {row.original.tipoDia === 'FIN_SEMANA_FERIADO'
            ? 'Fin de Semana / Feriado'
            : row.original.tipoDia === 'SEMANA'
              ? 'Dia de Semana'
              : row.original.tipoDia}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'estado',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">Estado</span>
    ),
    cell: ({ row }) => (
      <ReservaStatusBadge
        estado={row.original.estado}
        ingresado={row.original.ingresado}
        esReprogramacion={row.original.esReprogramacion}
        fechaEvento={row.original.fechaEvento}
      />
    ),
  },
  {
    accessorKey: 'nombreNino',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">Niño</span>
    ),
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {row.original.nombreNino}
        </p>
        <p className="text-xs text-gray-400 font-medium">
          {row.original.edadNino} años
        </p>
      </div>
    ),
  },

  {
    accessorKey: 'nombreCliente',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">Cliente</span>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-gray-700 font-medium">
          {row.original.nombreCliente ?? '—'}
        </span>
        <span className="text-[10px] text-gray-400 font-bold uppercase">
          {row.original.canalReserva === 'MOSTRADOR'
            ? 'Caja'
            : row.original.canalReserva === 'WEB'
              ? 'Web'
              : row.original.canalReserva}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'totalPagado',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">Pago</span>
    ),
    cell: ({ row }) => {
      const { medioPago, estado, totalPagado } = row.original
      const esYapePendiente = medioPago === 'YAPE' && estado === 'PENDIENTE'
      const esYapeConfirmado = medioPago === 'YAPE' && estado !== 'PENDIENTE'

      return (
        <div>
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(totalPagado)}
          </p>
          {medioPago && (
            <span
              className={cn(
                'inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md mt-0.5',
                esYapePendiente
                  ? 'bg-amber-100 text-amber-700'
                  : esYapeConfirmado
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-400'
              )}
            >
              {esYapePendiente
                ? 'Yape pendiente'
                : esYapeConfirmado
                  ? 'Yape verificado'
                  : medioPago}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'acciones',
    header: () => (
      <span className="text-xs font-bold text-gray-400 uppercase">
        Acciones
      </span>
    ),
    cell: ({ row }) => (
      <RowActions reserva={row.original} onView={onView} onAction={onAction} />
    ),
  },
]
