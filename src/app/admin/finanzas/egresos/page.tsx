'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Plus, ChevronLeft, ChevronRight, Pencil, X, Tag, Eye,
  Receipt, CalendarDays, Wrench,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useEgresos,
  useEgresosPorRango,
  useEgresoMutations,
  useGastosOperativosPorRango,
  useGastosEventoPorRango,
  useTiposEgreso,
  RegistrarEgresoModal,
  PeriodoSelector,
  TiposEgresoManager,
  RegistroEgreso,
} from '@/features/admin/finanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/Sheet'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'egresos' | 'gastos-op' | 'gastos-ev'

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  )
}

const PAGE_SIZE = 20

function getPageNums(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  if (current <= 3) return [0, 1, 2, 3, null, total - 2, total - 1]
  if (current >= total - 4) return [0, 1, null, total - 4, total - 3, total - 2, total - 1]
  return [0, null, current - 1, current, current + 1, null, total - 1]
}

function formatFecha(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function EgresosPage() {
  const { idSede } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tab = (searchParams.get('tab') as Tab) ?? 'egresos'
  const anio = Number(searchParams.get('anio')) || new Date().getFullYear()
  const mes = Number(searchParams.get('mes')) || (new Date().getMonth() + 1)
  const desde = searchParams.get('desde') ?? ''
  const hasta = searchParams.get('hasta') ?? ''
  const page = Number(searchParams.get('page') ?? '0')
  const filtroTipo = searchParams.get('tipo') ?? ''
  const filtroRecurrente = searchParams.get('recurrente') ?? ''
  const q = searchParams.get('q') ?? ''

  const [openModal, setOpenModal] = useState(false)
  const [openTipos, setOpenTipos] = useState(false)
  const [editandoEgreso, setEditandoEgreso] = useState<RegistroEgreso | undefined>()
  const [detailEgreso, setDetailEgreso] = useState<RegistroEgreso | null>(null)

  const inicioMes = `${anio}-${String(mes).padStart(2, '0')}-01`
  const finMes = new Date(anio, mes, 0).toISOString().split('T')[0]

  const filtroActivo = !!desde && !!hasta

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const setTab = useCallback((value: Tab) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const setPeriodo = useCallback((newAnio: number, newMes: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('anio', String(newAnio))
    params.set('mes', String(newMes))
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const limpiarFiltro = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('desde')
    params.delete('hasta')
    params.delete('page')
    params.delete('tipo')
    params.delete('recurrente')
    params.delete('q')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const limpiarFiltrosSecundarios = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('tipo')
    params.delete('recurrente')
    params.delete('q')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const setPage = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams)
    if (p > 0) params.set('page', String(p))
    else params.delete('page')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const { data: paginado, isLoading: loadingPag } = useEgresos(
    tab === 'egresos' && !filtroActivo ? (idSede ?? undefined) : undefined,
    page, 20
  )
  const { data: rangeLista = [], isLoading: loadingRango } = useEgresosPorRango(
    tab === 'egresos' && filtroActivo ? (idSede ?? undefined) : undefined,
    desde || undefined, hasta || undefined
  )
  const { data: gastosOp = [], isLoading: loadingOp } = useGastosOperativosPorRango(
    tab === 'gastos-op' ? (idSede ?? undefined) : undefined,
    inicioMes, finMes
  )
  const { data: gastosEv = [], isLoading: loadingEv } = useGastosEventoPorRango(
    tab === 'gastos-ev' ? (idSede ?? undefined) : undefined,
    inicioMes, finMes
  )
  const { data: tiposEgreso = [] } = useTiposEgreso()

  const { eliminar } = useEgresoMutations()

  function resolverTipoEgreso(codigo: string) {
    return tiposEgreso.find((t) => t.codigo === codigo)?.nombre ?? codigo
  }

  const isLoadingEgresos = filtroActivo ? loadingRango : loadingPag

  const filteredRange = filtroActivo
    ? rangeLista.filter((e) => {
        if (filtroTipo && e.tipoEgresoCodigo !== filtroTipo) return false
        if (filtroRecurrente === 'si' && !e.esRecurrente) return false
        if (filtroRecurrente === 'no' && e.esRecurrente) return false
        if (q) {
          const search = q.toLowerCase()
          if (!e.descripcion?.toLowerCase().includes(search) && !e.tipoEgresoCodigo.toLowerCase().includes(search)) return false
        }
        return true
      })
    : []

  const egresos = filtroActivo
    ? filteredRange.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    : (paginado?.content ?? [])
  const totalEgresosResults = filtroActivo ? filteredRange.length : (paginado?.totalElements ?? 0)
  const totalEgresosPagesDisplay = filtroActivo
    ? Math.max(1, Math.ceil(filteredRange.length / PAGE_SIZE))
    : (paginado?.totalPages ?? 1)

  const tieneFiltrosSecundarios = !!(filtroTipo || filtroRecurrente || q)
  const totalGastosOp = gastosOp.reduce((s, g) => s + g.monto, 0)
  const totalGastosEv = gastosEv.reduce((s, g) => s + g.monto, 0)

  function abrirNuevo() {
    setEditandoEgreso(undefined)
    setOpenModal(true)
  }

  function abrirEditar(e: RegistroEgreso) {
    setEditandoEgreso(e)
    setOpenModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Egresos" description="Historial de egresos y gastos de la sede" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpenTipos(true)} className="gap-1.5">
            <Tag className="h-4 w-4" />
            Gestionar tipos
          </Button>
          {tab === 'egresos' && (
            <Button
              size="sm"
              onClick={abrirNuevo}
              className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Registrar egreso
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="egresos" className="gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              Egresos registrados
            </TabsTrigger>
            <TabsTrigger value="gastos-op" className="gap-1.5">
              <Wrench className="h-3.5 w-3.5" />
              Gastos operativos
            </TabsTrigger>
            <TabsTrigger value="gastos-ev" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Gastos de evento
            </TabsTrigger>
          </TabsList>

          {tab !== 'egresos' && (
            <PeriodoSelector
              anio={anio}
              mes={mes}
              onAnio={(v) => setPeriodo(v, mes)}
              onMes={(v) => setPeriodo(anio, v)}
            />
          )}
        </div>

        <TabsContent value="egresos">
          <div className="space-y-4">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Desde</Label>
                <Input
                  type="date"
                  value={desde}
                  onChange={(e) => setParam('desde', e.target.value)}
                  className="h-9 w-40"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hasta</Label>
                <Input
                  type="date"
                  value={hasta}
                  onChange={(e) => setParam('hasta', e.target.value)}
                  className="h-9 w-40"
                />
              </div>
              {filtroActivo && (
                <Button size="sm" variant="outline" onClick={limpiarFiltro} className="gap-1.5 h-9">
                  <X className="h-4 w-4" />
                  Limpiar filtro
                </Button>
              )}
            </div>

            {filtroActivo && (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filtroTipo}
                  onChange={(e) => setParam('tipo', e.target.value)}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-azul"
                >
                  <option value="">Todos los tipos</option>
                  {tiposEgreso.filter((t) => t.activo).map((t) => (
                    <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                  ))}
                </select>

                <select
                  value={filtroRecurrente}
                  onChange={(e) => setParam('recurrente', e.target.value)}
                  className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-azul"
                >
                  <option value="">Todos</option>
                  <option value="si">Recurrentes</option>
                  <option value="no">No recurrentes</option>
                </select>

                <div className="relative">
                  <Input
                    placeholder="Buscar…"
                    value={q}
                    onChange={(e) => setParam('q', e.target.value)}
                    className="h-8 w-36 text-xs pr-7"
                  />
                  {q && (
                    <button
                      type="button"
                      onClick={() => setParam('q', '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {tieneFiltrosSecundarios && (
                  <Button size="sm" variant="ghost" onClick={limpiarFiltrosSecundarios} className="h-8 gap-1 text-xs text-gray-500 px-2">
                    <X className="h-3 w-3" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-4 py-3 font-semibold">Tipo</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Periodo</th>
                      <th className="px-4 py-3 font-semibold text-right">Monto</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingEgresos ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-4 bg-gray-100 rounded animate-pulse" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : egresos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                          {filtroActivo && tieneFiltrosSecundarios
                            ? 'Sin resultados para esos filtros.'
                            : 'Sin egresos registrados.'}
                        </td>
                      </tr>
                    ) : (
                      egresos.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{e.tipoEgresoCodigo}</p>
                            {e.descripcion && (
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.descripcion}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{e.fecha}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {e.periodoMes && e.periodoAnio
                              ? `${String(e.periodoMes).padStart(2, '0')}/${e.periodoAnio}`
                              : '—'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600">
                            {formatCurrency(e.monto)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setDetailEgreso(e)}
                                className="p-1 text-gray-400 hover:text-brand-azul transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => abrirEditar(e)}
                                className="p-1 text-gray-400 hover:text-brand-azul transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminar.mutate(e.id)}
                                disabled={eliminar.isPending}
                                className="p-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!isLoadingEgresos && totalEgresosResults > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t gap-4 flex-wrap">
                  <p className="text-xs text-gray-400">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalEgresosResults)} de {totalEgresosResults} registros
                  </p>
                  {totalEgresosPagesDisplay > 1 && (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {getPageNums(page, totalEgresosPagesDisplay).map((n, i) =>
                        n === null
                          ? <span key={`e${i}`} className="w-5 text-center text-gray-400 text-xs select-none">…</span>
                          : <Button
                              key={n}
                              size="sm"
                              variant="outline"
                              onClick={() => setPage(n)}
                              className={cn('h-7 w-7 p-0 text-xs', n === page && 'bg-brand-azul text-white hover:bg-brand-azul/90 border-brand-azul')}
                            >
                              {n + 1}
                            </Button>
                      )}
                      <Button size="sm" variant="outline" disabled={page >= totalEgresosPagesDisplay - 1} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gastos-op">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Descripción</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Comprobante</th>
                    <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingOp ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : gastosOp.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                        Sin gastos operativos para este período.
                      </td>
                    </tr>
                  ) : (
                    gastosOp.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800">{g.descripcion}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{formatFecha(g.fecha)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {g.comprobanteUrl ? (
                            <span className="text-brand-azul">{g.comprobanteUrl}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(g.monto)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {gastosOp.length > 0 && (
                  <tfoot className="border-t-2 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-600">
                        {formatCurrency(totalGastosOp)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gastos-ev">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Descripción</th>
                    <th className="px-4 py-3 font-semibold">Fecha evento</th>
                    <th className="px-4 py-3 font-semibold">Comprobante</th>
                    <th className="px-4 py-3 font-semibold text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingEv ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : gastosEv.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                        Sin gastos de evento para este período.
                      </td>
                    </tr>
                  ) : (
                    gastosEv.map((g) => (
                      <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800">{g.descripcion}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {g.fechaEvento ? formatFecha(g.fechaEvento) : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {g.comprobanteUrl ? (
                            <span className="text-brand-azul">{g.comprobanteUrl}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          {formatCurrency(g.monto)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {gastosEv.length > 0 && (
                  <tfoot className="border-t-2 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-black text-red-600">
                        {formatCurrency(totalGastosEv)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={openTipos} onOpenChange={setOpenTipos}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tipos de egreso</SheetTitle>
          </SheetHeader>
          <div className="px-1 py-4">
            <TiposEgresoManager />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!detailEgreso} onOpenChange={(o) => !o && setDetailEgreso(null)}>
        <SheetContent side="right" className="flex flex-col overflow-hidden sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalle del egreso</SheetTitle>
            <SheetCloseButton />
          </SheetHeader>
          {detailEgreso && (
            <>
              <div className="shrink-0 bg-red-50 border-b border-red-100 px-5 py-5">
                <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-1.5">
                  {resolverTipoEgreso(detailEgreso.tipoEgresoCodigo)}
                </p>
                <p className="text-3xl font-black text-red-600 tracking-tight">
                  {formatCurrency(detailEgreso.monto)}
                </p>
                <p className="text-sm text-red-500 mt-1.5">{formatFecha(detailEgreso.fecha)}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {detailEgreso.periodoMes && detailEgreso.periodoAnio && (
                  <InfoRow label="Período">
                    {String(detailEgreso.periodoMes).padStart(2, '0')}/{detailEgreso.periodoAnio}
                  </InfoRow>
                )}

                <InfoRow label="¿Es recurrente?">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                    detailEgreso.esRecurrente
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600',
                  )}>
                    {detailEgreso.esRecurrente ? 'Sí' : 'No'}
                  </span>
                </InfoRow>

                {detailEgreso.descripcion && (
                  <InfoRow label="Descripción">
                    {detailEgreso.descripcion}
                  </InfoRow>
                )}

                {detailEgreso.comprobanteUrl && (
                  <InfoRow label="Comprobante / Referencia">
                    {detailEgreso.comprobanteUrl}
                  </InfoRow>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Registrado el {new Date(detailEgreso.fechaCreacion).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {idSede && (
        <RegistrarEgresoModal
          open={openModal}
          onOpenChange={(v) => {
            setOpenModal(v)
            if (!v) setEditandoEgreso(undefined)
          }}
          idSede={idSede}
          egreso={editandoEgreso}
        />
      )}
    </div>
  )
}

