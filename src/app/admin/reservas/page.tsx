'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ColumnDef } from '@tanstack/react-table'
import {
  Search,
  RefreshCw,
  Ticket,
  Users,
  XCircle,
  LogIn,
  TrendingUp,
  BarChart2,
  X,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  Eye,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import {
  useReservas,
  useMetricasReservas,
  useCancelarReserva,
  useConfirmarIngreso,
} from '@/hooks/useReservas'
import { Reserva, EstadoReserva } from '@/types/reserva.types'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ReservaDrawer } from '@/components/admin/reservas/ReservaDrawer'
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

const ESTADOS: { value: EstadoReserva | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'REPROGRAMADA', label: 'Reprogramada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMADA: 'bg-green-100 text-green-800 border-green-200',
  REPROGRAMADA: 'bg-purple-100 text-purple-700 border-purple-200',
  COMPLETADA: 'bg-blue-100 text-blue-700 border-blue-200',
  CANCELADA: 'bg-red-100 text-red-700 border-red-200',
}

function MetricaCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

type Dialog = { type: 'cancelar' | 'ingreso'; reserva: Reserva } | null

export default function ReservasPage() {
  const { idSede } = useAuth()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoReserva | ''>('')
  const [fecha, setFecha] = useState('')
  const [ingresado, setIngresado] = useState<boolean | undefined>()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [drawer, setDrawer] = useState<Reserva | null>(null)

  const dSearch = useDebounce(search, 350)

  const { data, isLoading, isError, refetch } = useReservas({
    page,
    size: 20,
    idSede: idSede ?? undefined,
    estado: estado || undefined,
    fecha: fecha || undefined,
    ingresado,
    search: dSearch || undefined,
  })

  const { data: metricas } = useMetricasReservas(
    idSede ?? undefined,
    fecha || undefined
  )

  const cancelar = useCancelarReserva()
  const ingreso = useConfirmarIngreso()

  const handleSearch = (v: string) => {
    setSearch(v)
    setPage(0)
  }
  const handleEstado = (v: string) => {
    setEstado(v as EstadoReserva)
    setPage(0)
  }
  const closeDialog = () => setDialog(null)

  const columns: ColumnDef<Reserva>[] = [
    {
      accessorKey: 'numeroTicket',
      header: () => (
        <span className="text-xs font-bold text-gray-400 uppercase">
          Ticket
        </span>
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg">
          {row.original.numeroTicket}
        </span>
      ),
    },
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
        <span className="text-sm text-gray-700">
          {formatDate(row.original.fechaEvento)}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: () => (
        <span className="text-xs font-bold text-gray-400 uppercase">
          Estado
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] font-bold',
              ESTADO_BADGE[row.original.estado]
            )}
          >
            {row.original.estado}
          </Badge>
          {row.original.ingresado && (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'nombreNino',
      header: () => (
        <span className="text-xs font-bold text-gray-400 uppercase">Nino</span>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {row.original.nombreNino}
          </p>
          <p className="text-xs text-gray-400">{row.original.edadNino} anos</p>
        </div>
      ),
    },
    {
      accessorKey: 'nombreCliente',
      header: () => (
        <span className="text-xs font-bold text-gray-400 uppercase">
          Cliente
        </span>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.nombreCliente ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'totalPagado',
      header: () => (
        <span className="text-xs font-bold text-gray-400 uppercase">Pago</span>
      ),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-bold text-gray-900">
            {formatCurrency(row.original.totalPagado)}
          </p>
          {row.original.medioPago && (
            <p className="text-[10px] text-gray-400">
              {row.original.medioPago}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'acciones',
      cell: ({ row }) => {
        const r = row.original
        const cancelable = ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
        const puedeIngreso =
          !r.ingresado && ['PENDIENTE', 'CONFIRMADA'].includes(r.estado)
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-gray-400 hover:text-brand-azul"
              onClick={() => setDrawer(r)}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {puedeIngreso && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-green-600"
                onClick={() => setDialog({ type: 'ingreso', reserva: r })}
              >
                <LogIn className="h-3.5 w-3.5" />
              </Button>
            )}
            {cancelable && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-gray-400 hover:text-destructive"
                onClick={() => setDialog({ type: 'cancelar', reserva: r })}
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Reservas' }]} />

      <PageHeader
        title="Reservas"
        description="Gestion operativa de reservas y control de acceso al local"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        }
      />

      {metricas && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <MetricaCard
            icon={Ticket}
            label="Total del dia"
            value={metricas.totalReservas}
            color="bg-brand-azul/10 text-brand-azul"
          />
          <MetricaCard
            icon={BarChart2}
            label="Pendientes"
            value={metricas.pendientes}
            color="bg-yellow-100 text-yellow-700"
          />
          <MetricaCard
            icon={XCircle}
            label="Canceladas"
            value={metricas.canceladas}
            color="bg-red-100 text-red-600"
          />
          <MetricaCard
            icon={LogIn}
            label="Ingresados"
            value={metricas.ingresados}
            color="bg-green-100 text-green-700"
          />
          <MetricaCard
            icon={TrendingUp}
            label="Ingresos"
            value={formatCurrency(metricas.ingresosDia ?? 0, 0)}
            color="bg-brand-menta/20 text-emerald-700"
            sub={`${metricas.aforoRestante} plazas libres`}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Ticket, nino, acompanante..."
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
          onChange={(e) => {
            setFecha(e.target.value)
            setPage(0)
          }}
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

        <div className="flex items-center gap-2">
          {(
            [
              { value: undefined, label: 'Todos' },
              { value: false, label: 'Sin Ingreso' },
              { value: true, label: 'Ingresados' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => {
                setIngresado(value)
                setPage(0)
              }}
              className={cn(
                'px-3 h-10 rounded-xl text-xs font-semibold border transition-all',
                ingresado === value
                  ? 'bg-brand-azul text-white border-brand-azul'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-brand-azul/40'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {data?.totalElements !== undefined && (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-600 h-10 px-3 text-sm self-start sm:self-auto"
          >
            {data.totalElements} reservas
          </Badge>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron reservas con los filtros aplicados."
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

      <ReservaDrawer reserva={drawer} onClose={() => setDrawer(null)} />

      <ConfirmDialog
        open={dialog?.type === 'ingreso'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Confirmar ingreso"
        description={`Se registrara el ingreso del ticket ${dialog?.reserva.numeroTicket}.`}
        confirmLabel="Registrar ingreso"
        loading={ingreso.isPending}
        onConfirm={() =>
          dialog?.reserva &&
          ingreso.mutate(dialog.reserva.id, { onSettled: closeDialog })
        }
      />

      <ConfirmDialog
        open={dialog?.type === 'cancelar'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Cancelar reserva"
        description={`Se cancelara el ticket ${dialog?.reserva.numeroTicket}. Esta accion no puede revertirse.`}
        confirmLabel="Si, cancelar"
        destructive
        loading={cancelar.isPending}
        onConfirm={() =>
          dialog?.reserva &&
          cancelar.mutate(
            { id: dialog.reserva.id, motivo: 'Cancelacion por administrador' },
            { onSettled: closeDialog }
          )
        }
      />
    </div>
  )
}
