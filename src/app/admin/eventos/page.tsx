'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useEventos, useCancelarEvento } from '@/hooks/useEventos'
import {
  EventoPrivado,
  EstadoEvento,
  calcularIndicadores,
} from '@/types/evento.types'
import { ConfirmarEventoModal } from '@/components/admin/eventos/ConfirmarEventoModal'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { formatDate, formatCurrency, cn } from '@/lib/utils'

const ESTADOS: { value: EstadoEvento | ''; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'SOLICITADA', label: 'Solicitada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA',  label: 'Cancelada' },
]

const ESTADO_BADGE: Record<string, string> = {
  SOLICITADA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  COMPLETADA: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELADA:  'bg-red-100 text-red-700 border-red-200',
}

const INDICADOR_ICON: Record<string, React.ElementType> = {
  CONTRATO:  FileText,
  PAGO:      CreditCard,
  CHECKLIST: CheckCircle2,
  PROVEEDOR: AlertTriangle,
}

const INDICADOR_COLOR: Record<string, string> = {
  DANGER:  'text-red-500',
  WARNING: 'text-amber-500',
  OK:      'text-green-500',
}

export default function EventosPage() {
  const router     = useRouter()
  const { idSede } = useAuth()
  const [page,   setPage]   = useState(0)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoEvento | ''>('')
  const [fecha,  setFecha]  = useState('')
  const [eventoConfirmar, setEventoConfirmar] = useState<EventoPrivado | null>(null)

  const dSearch = useDebounce(search, 350)

  const { data, isLoading, isError, refetch } = useEventos({
    page,
    size: 15,
    idSede:  idSede ?? undefined,
    estado:  estado || undefined,
    fecha:   fecha  || undefined,
    search:  dSearch || undefined,
  })

  const cancelar = useCancelarEvento()

  const handleSearch = (v: string) => { setSearch(v); setPage(0) }
  const handleEstado = (v: string) => { setEstado(v as EstadoEvento); setPage(0) }

  const columns: ColumnDef<EventoPrivado>[] = [
    {
      accessorKey: 'fechaEvento',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase hover:text-brand-azul"
        >
          Fecha <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(row.original.fechaEvento)}</p>
          <p className="text-xs text-gray-400">{row.original.turno} · {row.original.horaInicio}</p>
        </div>
      ),
    },
    {
      accessorKey: 'nombreCliente',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Cliente</span>,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">{row.original.nombreCliente}</p>
          <p className="text-xs text-gray-400 truncate max-w-[140px]">{row.original.correoCliente}</p>
        </div>
      ),
    },
    {
      accessorKey: 'tipoEvento',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Tipo</span>,
      cell: ({ row }) => (
        <span className="text-sm text-gray-700 truncate max-w-[120px] block">{row.original.tipoEvento}</span>
      ),
    },
    {
      accessorKey: 'aforoDeclarado',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Aforo</span>,
      cell: ({ row }) => <span className="text-sm text-gray-700">{row.original.aforoDeclarado ?? '—'}</span>,
    },
    {
      accessorKey: 'estado',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Estado</span>,
      cell: ({ row }) => (
        <Badge variant="outline" className={cn('text-[10px] font-bold', ESTADO_BADGE[row.original.estado])}>
          {row.original.estado}
        </Badge>
      ),
    },
    {
      id: 'indicadores',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Alertas</span>,
      cell: ({ row }) => {
        const indicadores = calcularIndicadores(row.original)
        if (!indicadores.length) return <CheckCircle2 className="h-4 w-4 text-green-400" />
        return (
          <div className="flex items-center gap-1">
            {indicadores.map((ind, i) => {
              const Icon = INDICADOR_ICON[ind.tipo] ?? AlertTriangle
              return (
                <div key={i} title={ind.mensaje}>
                  <Icon className={cn('h-3.5 w-3.5', INDICADOR_COLOR[ind.nivel])} />
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      accessorKey: 'precioTotalContrato',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Contrato</span>,
      cell: ({ row }) => {
        const e = row.original
        return (
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {e.precioTotalContrato ? formatCurrency(e.precioTotalContrato) : '—'}
            </p>
            {e.montoSaldo && e.montoSaldo > 0 && (
              <p className="text-xs text-amber-600 font-semibold">
                Saldo: {formatCurrency(e.montoSaldo)}
              </p>
            )}
          </div>
        )
      },
    },
    {
      id: 'acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg gap-1.5 text-xs text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8"
            onClick={() => router.push(`/admin/eventos/${row.original.id}`)}
          >
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
          {row.original.estado === 'SOLICITADA' && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg gap-1.5 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => setEventoConfirmar(row.original)}
            >
              Confirmar
            </Button>
          )}
        </div>
      ),
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Eventos Privados' }]} />

      <PageHeader
        title="Eventos Privados"
        description="Gestion comercial y operativa de eventos"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente o tipo..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-gray-200"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Input
          type="date"
          value={fecha}
          onChange={(e) => { setFecha(e.target.value); setPage(0) }}
          className="h-10 rounded-xl border-gray-200 w-44"
        />

        <Select value={estado} onValueChange={handleEstado}>
          <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 text-sm">
            <SelectValue placeholder="Estado..." />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map(({ value, label }) => (
              <SelectItem key={value || 'todos'} value={value || 'todos'}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {data?.totalElements !== undefined && (
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 h-10 px-3 text-sm self-start sm:self-auto">
            {data.totalElements} eventos
          </Badge>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron eventos con los filtros aplicados."
        />
      </div>

      {data && data.totalPages > 1 && (
        <DataTablePagination
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={data.size}
          onPageChange={setPage}
        />
      )}

      {eventoConfirmar && (
        <ConfirmarEventoModal
          evento={eventoConfirmar}
          open={!!eventoConfirmar}
          onClose={() => setEventoConfirmar(null)}
        />
      )}
    </div>
  )
}
