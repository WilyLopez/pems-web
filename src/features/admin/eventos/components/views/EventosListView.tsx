'use client'

import React, { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ArrowUpDown,
  Plus,
  Download,
  MessageCircle,
  AlertTriangle,
  Filter,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Wallet,
} from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { useEventos, useEventosKpis } from '../../hooks/useEventos'
import { useTiposEventoAdmin } from '@/features/admin/comercial/tipos-evento/hooks/useTiposEvento'
import { EventoPrivado, EstadoEvento } from '../../types'
import { EventoEstadoBadge } from '../ui/EventoEstadoBadge'
import { EventoAlertasBadges } from '../ui/EventoAlertasBadges'
import { ConfirmarEventoModal } from '@/components/admin/eventos/ConfirmarEventoModal'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { DataTable } from '@/components/common/DataTable/DataTable'
import { DataTablePagination } from '@/components/common/DataTable/DataTablePagination'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { formatDate, formatCurrency, cn, exportarCSV } from '@/lib/utils'
import { ADMIN_ROUTES } from '@/config/routes'

const ESTADOS: { value: EstadoEvento | ''; label: string }[] = [
  { value: '',           label: 'Todos los estados' },
  { value: 'SOLICITADA', label: 'Solicitada' },
  { value: 'CONFIRMADA', label: 'Confirmada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA',  label: 'Cancelada' },
]

const MODALIDADES = [
  { value: '',           label: 'Toda modalidad' },
  { value: 'AL_CONTADO', label: 'Al contado' },
  { value: 'CUOTAS',     label: 'En cuotas' },
]

const TABS_RAPIDOS = [
  { label: 'Todos',       fechaDesde: '',  fechaHasta: '' },
  { label: 'Hoy',         key: 'hoy' },
  { label: 'Esta semana', key: 'semana' },
  { label: 'Este mes',    key: 'mes' },
]

function getRangoTab(key?: string): { fechaDesde: string; fechaHasta: string } {
  const hoy = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  if (key === 'hoy') {
    const s = fmt(hoy)
    return { fechaDesde: s, fechaHasta: s }
  }
  if (key === 'semana') {
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const domingo = new Date(lunes)
    domingo.setDate(lunes.getDate() + 6)
    return { fechaDesde: fmt(lunes), fechaHasta: fmt(domingo) }
  }
  if (key === 'mes') {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
    return { fechaDesde: fmt(inicio), fechaHasta: fmt(fin) }
  }
  return { fechaDesde: '', fechaHasta: '' }
}

interface KpiCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  iconBg: string
  valueColor: string
  hint?: string
}

function KpiCard({ label, value, icon, iconBg, valueColor, hint }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        {value === undefined
          ? <Skeleton className="h-7 w-10 mb-0.5" />
          : <p className={cn('text-2xl font-black leading-none', valueColor)}>{value}</p>}
        <p className="text-xs text-gray-400 leading-tight mt-0.5">{label}</p>
        {hint && <p className="text-[10px] text-gray-300 mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

function esUrgente(evento: EventoPrivado): boolean {
  if (evento.estado !== 'SOLICITADA') return false
  try {
    return differenceInDays(parseISO(evento.fechaEvento), new Date()) <= 2
  } catch {
    return false
  }
}

export function EventosListView() {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const { idSede }  = useAuth()

  const getParam = (k: string, def = '') => searchParams.get(k) ?? def

  const [search,       setSearch]       = useState(getParam('search'))
  const [estado,       setEstado]       = useState<EstadoEvento | ''>(getParam('estado') as EstadoEvento | '')
  const [fechaDesde,   setFechaDesde]   = useState(getParam('fechaDesde'))
  const [fechaHasta,   setFechaHasta]   = useState(getParam('fechaHasta'))
  const [tipoEvento,   setTipoEvento]   = useState(getParam('tipoEvento'))
  const [modalidadPago,setModalidadPago]= useState(getParam('modalidadPago'))
  const [page,         setPage]         = useState(Number(getParam('page', '0')))
  const [size,         setSize]         = useState(Number(getParam('size', '15')))
  const [sort,         setSort]         = useState(getParam('sort', 'fechaEvento,asc'))
  const [tabActivo,    setTabActivo]    = useState(getParam('tab', 'todos'))
  const [eventoConfirmar, setEventoConfirmar] = useState<EventoPrivado | null>(null)

  const dSearch = useDebounce(search, 350)

  function syncUrl(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v)
      else params.delete(k)
    })
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(v: string) { setSearch(v); setPage(0); syncUrl({ search: v, page: '0' }) }
  function handleEstado(v: string) { setEstado(v as EstadoEvento); setPage(0); syncUrl({ estado: v, page: '0' }) }
  function handleTipo(v: string) { setTipoEvento(v); setPage(0); syncUrl({ tipoEvento: v, page: '0' }) }
  function handleModalidad(v: string) { setModalidadPago(v); setPage(0); syncUrl({ modalidadPago: v, page: '0' }) }
  function handleFechaDesde(v: string) { setFechaDesde(v); setPage(0); syncUrl({ fechaDesde: v, page: '0' }) }
  function handleFechaHasta(v: string) { setFechaHasta(v); setPage(0); syncUrl({ fechaHasta: v, page: '0' }) }
  function handlePage(p: number) { setPage(p); syncUrl({ page: String(p) }) }
  function handleSize(s: number) { setSize(s); setPage(0); syncUrl({ size: String(s), page: '0' }) }
  function handleSort(s: string) { setSort(s); setPage(0); syncUrl({ sort: s, page: '0' }) }

  function handleTab(tab: string) {
    setTabActivo(tab)
    const tabDef = TABS_RAPIDOS.find((t) => (t.key ?? 'todos') === tab || t.label.toLowerCase() === tab)
    const rango = tab === 'todos' ? { fechaDesde: '', fechaHasta: '' } : getRangoTab(tab)
    setFechaDesde(rango.fechaDesde)
    setFechaHasta(rango.fechaHasta)
    setPage(0)
    syncUrl({ tab, fechaDesde: rango.fechaDesde, fechaHasta: rango.fechaHasta, page: '0' })
  }

  function limpiarFiltros() {
    setSearch(''); setEstado(''); setFechaDesde(''); setFechaHasta('')
    setTipoEvento(''); setModalidadPago(''); setPage(0); setTabActivo('todos')
    router.replace(pathname, { scroll: false })
  }

  const filtrosActivos = [search, estado, fechaDesde, fechaHasta, tipoEvento, modalidadPago]
    .filter(Boolean).length

  const { data, isLoading, isError, refetch } = useEventos({
    page, size, sort,
    idSede:       idSede ?? undefined,
    estado:       estado || undefined,
    fechaDesde:   fechaDesde || undefined,
    fechaHasta:   fechaHasta || undefined,
    tipoEvento:   tipoEvento || undefined,
    modalidadPago:modalidadPago || undefined,
    search:       dSearch || undefined,
  })

  const { data: kpis } = useEventosKpis(idSede ?? undefined)
  const { data: tiposEvento = [] } = useTiposEventoAdmin()

  function handleExportCSV() {
    if (!data?.content?.length) return
    exportarCSV('eventos.csv', data.content.map((e) => ({
      Fecha:      e.fechaEvento,
      Cliente:    e.nombreCliente,
      Correo:     e.correoCliente ?? '',
      Tipo:       e.tipoEvento,
      Turno:      e.turno,
      Aforo:      e.aforoDeclarado ?? '',
      Estado:     e.estado,
      Modalidad:  e.modalidadPago ?? '',
      Precio:     e.precioTotalContrato ?? '',
      Adelanto:   e.montoAdelanto ?? '',
      Saldo:      e.montoSaldo ?? '',
    })))
  }

  const columns: ColumnDef<EventoPrivado>[] = [
    {
      accessorKey: 'fechaEvento',
      header: ({ column }) => (
        <button
          onClick={() => {
            const next = sort === 'fechaEvento,asc' ? 'fechaEvento,desc' : 'fechaEvento,asc'
            handleSort(next)
            column.toggleSorting(column.getIsSorted() === 'asc')
          }}
          className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase hover:text-brand-azul"
        >
          Fecha <ArrowUpDown className="h-3 w-3" />
        </button>
      ),
      cell: ({ row }) => {
        const urgente = esUrgente(row.original)
        return (
          <div className="flex items-center gap-2">
            {urgente && <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(row.original.fechaEvento)}</p>
              <p className="text-xs text-gray-400">{row.original.turno} · {row.original.horaInicio}</p>
            </div>
          </div>
        )
      },
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
      accessorKey: 'estado',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Estado</span>,
      cell: ({ row }) => <EventoEstadoBadge estado={row.original.estado} size="sm" />,
    },
    {
      id: 'indicadores',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Alertas</span>,
      cell: ({ row }) => <EventoAlertasBadges evento={row.original} variant="icons" />,
    },
    {
      accessorKey: 'precioTotalContrato',
      header: () => <span className="text-xs font-bold text-gray-400 uppercase">Precio</span>,
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
      cell: ({ row }) => {
        const e = row.original
        return (
          <div className="flex items-center gap-1" onClick={(ev) => ev.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg gap-1 text-xs text-gray-500 hover:text-brand-azul hover:bg-brand-azul/8"
              onClick={() => router.push(ADMIN_ROUTES.eventoDetalle(e.id))}
            >
              <Eye className="h-3.5 w-3.5" />
              Ver
            </Button>
            {e.estado === 'SOLICITADA' && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => setEventoConfirmar(e)}
              >
                Confirmar
              </Button>
            )}
            {e.telefonoCliente && (
              <a
                href={`https://wa.me/51${e.telefonoCliente.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${e.nombreCliente}, le contactamos sobre su evento del ${formatDate(e.fechaEvento)}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )
      },
    },
  ]

  if (isError) return <ErrorState onRetry={refetch} />

  const hayFiltros = filtrosActivos > 0

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Eventos Privados' }]} />

      <PageHeader
        title="Eventos Privados"
        description="Gestion comercial y operativa de eventos"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={!data?.content?.length}
              className="rounded-xl gap-1.5"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl gap-1.5">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-1.5 bg-brand-rosa hover:bg-brand-rosa/90 text-white"
              onClick={() => router.push('/admin/eventos/nuevo')}
            >
              <Plus className="h-4 w-4" />
              Nuevo evento
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard
          label="Por confirmar"
          value={kpis?.solicitadas}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
          valueColor="text-amber-600"
          hint="Requieren atencion"
        />
        <KpiCard
          label="Confirmados"
          value={kpis?.confirmadas}
          icon={<CalendarCheck className="h-5 w-5 text-brand-azul" />}
          iconBg="bg-brand-azul/8"
          valueColor="text-brand-azul"
          hint="Eventos activos"
        />
        <KpiCard
          label="Completados"
          value={kpis?.completadasEsteMes}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconBg="bg-green-50"
          valueColor="text-green-600"
          hint="Este mes"
        />
        <KpiCard
          label="Saldo pendiente"
          value={kpis?.conSaldoPendiente}
          icon={<Wallet className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-50"
          valueColor="text-red-500"
          hint="Sin cobrar"
        />
      </div>

      <div className="flex gap-1 border-b border-gray-100 pb-0 overflow-x-auto">
        {[
          { key: 'todos',   label: 'Todos' },
          { key: 'hoy',     label: 'Hoy' },
          { key: 'semana',  label: 'Esta semana' },
          { key: 'mes',     label: 'Este mes' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => handleTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors',
              tabActivo === t.key
                ? 'border-brand-azul text-brand-azul'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
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

          <Select value={estado || 'todos'} onValueChange={(v) => handleEstado(v === 'todos' ? '' : v)}>
            <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="Estado..." />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS.map(({ value, label }) => (
                <SelectItem key={value || 'todos'} value={value || 'todos'}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={tipoEvento || 'todos'} onValueChange={(v) => handleTipo(v === 'todos' ? '' : v)}>
            <SelectTrigger className="h-10 w-44 rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="Tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo tipo</SelectItem>
              {tiposEvento.map((t) => (
                <SelectItem key={t.codigo} value={t.codigo}>{t.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modalidadPago || 'todos'} onValueChange={(v) => handleModalidad(v === 'todos' ? '' : v)}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-gray-200 text-sm">
              <SelectValue placeholder="Modalidad..." />
            </SelectTrigger>
            <SelectContent>
              {MODALIDADES.map(({ value, label }) => (
                <SelectItem key={value || 'todos'} value={value || 'todos'}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="rounded-xl gap-1.5 text-gray-500 hover:text-red-600"
            >
              <Filter className="h-3.5 w-3.5" />
              Limpiar
              <span className="bg-brand-azul text-white text-[10px] font-black px-1.5 rounded-full">
                {filtrosActivos}
              </span>
            </Button>
          )}

          {data?.totalElements !== undefined && (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 h-10 px-3 text-sm ml-auto">
              {data.totalElements} eventos
            </Badge>
          )}
        </div>

        {tabActivo === 'todos' && (
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">Desde</span>
              <div className="relative">
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => handleFechaDesde(e.target.value)}
                  className="h-9 rounded-xl border-gray-200 w-40 pr-7 text-sm"
                />
                {fechaDesde && (
                  <button
                    onClick={() => handleFechaDesde('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">Hasta</span>
              <div className="relative">
                <Input
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde || undefined}
                  onChange={(e) => handleFechaHasta(e.target.value)}
                  className="h-9 rounded-xl border-gray-200 w-40 pr-7 text-sm"
                />
                {fechaHasta && (
                  <button
                    onClick={() => handleFechaHasta('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          emptyMessage="No se encontraron eventos con los filtros aplicados."
          onRowClick={(evento) => router.push(ADMIN_ROUTES.eventoDetalle(evento.id))}
          getRowClassName={(evento) =>
            esUrgente(evento) ? 'bg-red-50/40 border-l-2 border-l-red-400' : ''
          }
        />
      </div>

      <DataTablePagination
        page={data?.page ?? 0}
        totalPages={data?.totalPages ?? 0}
        totalElements={data?.totalElements ?? 0}
        size={size}
        onPageChange={handlePage}
        onSizeChange={handleSize}
      />

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
