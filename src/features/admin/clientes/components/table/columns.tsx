import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye } from 'lucide-react'
import { Cliente } from '../../types'
import { ClienteAvatar } from '../ui/ClienteAvatar'
import { VipBadge, VisitasBadge, EstadoBadge } from '../ui/ClienteBadges'
import { Button } from '@/components/ui/Button'
import { formatDate, toTitleCase } from '@/lib/utils'

export const createColumns = (
  onVerPerfil: (cliente: Cliente) => void
): ColumnDef<Cliente>[] => [
  {
    accessorKey: 'nombreCompleto',
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-brand-azul transition-colors"
      >
        Cliente
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    ),
    cell: ({ row }) => {
      const c = row.original
      return (
        <div className="flex items-center gap-3 max-w-[220px]">
          <ClienteAvatar
            nombre={c.nombreCompleto}
            fotoPerfil={undefined}
            esVip={c.esVip}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {toTitleCase(c.nombreCompleto)}
            </p>
            <p className="text-xs text-gray-400 truncate">{c.correo}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'telefono',
    header: () => (
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Telefono
      </span>
    ),
    cell: ({ row }) =>
      row.original.telefono ? (
        <span className="text-sm text-gray-700">{row.original.telefono}</span>
      ) : (
        <span className="text-xs text-gray-400 italic">Sin registro</span>
      ),
  },
  {
    accessorKey: 'esVip',
    header: () => (
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        VIP
      </span>
    ),
    cell: ({ row }) =>
      row.original.esVip ? (
        <VipBadge descuento={row.original.descuentoVip} />
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      ),
  },
  {
    accessorKey: 'activo',
    header: () => (
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Estado
      </span>
    ),
    cell: ({ row }) => <EstadoBadge activo={row.original.activo} />,
  },
  {
    accessorKey: 'contadorVisitas',
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-brand-azul transition-colors"
      >
        Visitas
        <ArrowUpDown className="h-3.5 w-3.5" />
      </button>
    ),
    cell: ({ row }) => <VisitasBadge visitas={row.original.contadorVisitas} />,
  },
  {
    accessorKey: 'creadoEn',
    header: () => (
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Registro
      </span>
    ),
    cell: ({ row }) => (
      <span className="text-xs text-gray-500">
        {formatDate(row.original.creadoEn)}
      </span>
    ),
  },
  {
    id: 'acciones',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        className="rounded-lg gap-1.5 text-xs text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8"
        onClick={() => onVerPerfil(row.original)}
      >
        <Eye className="h-3.5 w-3.5" />
        Ver perfil
      </Button>
    ),
  },
]
