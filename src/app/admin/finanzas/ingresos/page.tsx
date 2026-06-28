'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Plus, ChevronLeft, ChevronRight, X, ArrowUpCircle, Tag, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import {
  useIngresos,
  useIngresosPorRango,
  useIngresoMutations,
  useTiposIngreso,
  ingresoManualSchema,
  RegistroIngreso,
  TiposIngresoManager,
} from '@/features/admin/finanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/Sheet'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { MEDIOS_PAGO } from '@/lib/finance-constants'

type FormValues = z.infer<typeof ingresoManualSchema>

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

export default function IngresosPage() {
  const { idSede } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const desde = searchParams.get('desde') ?? ''
  const hasta = searchParams.get('hasta') ?? ''
  const page = Number(searchParams.get('page') ?? '0')
  const filtroTipo = searchParams.get('tipo') ?? ''
  const filtroMedio = searchParams.get('medio') ?? ''
  const filtroOrigen = searchParams.get('origen') ?? ''
  const q = searchParams.get('q') ?? ''

  const [openModal, setModal] = useState(false)
  const [openTipos, setOpenTipos] = useState(false)
  const [detailIngreso, setDetailIngreso] = useState<RegistroIngreso | null>(null)

  const filtroActivo = !!desde && !!hasta

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    if (key !== 'page') params.delete('page')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const setPage = useCallback((p: number) => {
    const params = new URLSearchParams(searchParams)
    if (p > 0) params.set('page', String(p))
    else params.delete('page')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const limpiarRango = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('desde')
    params.delete('hasta')
    params.delete('page')
    params.delete('tipo')
    params.delete('medio')
    params.delete('origen')
    params.delete('q')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const limpiarFiltros = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('tipo')
    params.delete('medio')
    params.delete('origen')
    params.delete('q')
    router.push(`${pathname}?${params}`)
  }, [searchParams, router, pathname])

  const { data: paginado, isLoading: loadingPag } = useIngresos(
    !filtroActivo ? (idSede ?? undefined) : undefined,
    page, 20
  )
  const { data: rangeLista = [], isLoading: loadingRango } = useIngresosPorRango(
    filtroActivo ? (idSede ?? undefined) : undefined,
    desde || undefined,
    hasta || undefined
  )

  const { data: tipos = [] } = useTiposIngreso()
  const { registrar, eliminar } = useIngresoMutations()

  const isLoading = filtroActivo ? loadingRango : loadingPag

  const filteredRange = filtroActivo
    ? rangeLista.filter((e) => {
        if (filtroTipo && e.tipoIngresoCodigo !== filtroTipo) return false
        if (filtroMedio && e.medioPago !== filtroMedio) return false
        if (filtroOrigen === 'auto' && !e.esAutomatico) return false
        if (filtroOrigen === 'manual' && e.esAutomatico) return false
        if (q) {
          const search = q.toLowerCase()
          const nombre = tipos.find((t) => t.codigo === e.tipoIngresoCodigo)?.nombre ?? ''
          if (!e.descripcion?.toLowerCase().includes(search) && !nombre.toLowerCase().includes(search)) return false
        }
        return true
      })
    : []

  const ingresos = filtroActivo
    ? filteredRange.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    : (paginado?.content ?? [])
  const totalResults = filtroActivo ? filteredRange.length : (paginado?.totalElements ?? 0)
  const totalPagesDisplay = filtroActivo
    ? Math.max(1, Math.ceil(filteredRange.length / PAGE_SIZE))
    : (paginado?.totalPages ?? 1)

  const tienesFiltrosSecundarios = !!(filtroTipo || filtroMedio || filtroOrigen || q)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(ingresoManualSchema),
    defaultValues: { fecha: new Date().toISOString().slice(0, 10) },
  })

  function onSubmit(values: FormValues) {
    if (!idSede) return
    registrar.mutate(
      { idSede, payload: { ...values } },
      { onSuccess: () => { reset(); setModal(false) } }
    )
  }

  function resolverTipo(codigo: string) {
    return tipos.find((t) => t.codigo === codigo)?.nombre ?? codigo
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Ingresos" description="Historial de ingresos registrados en la sede" />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpenTipos(true)} className="gap-1.5">
            <Tag className="h-4 w-4" />
            Gestionar tipos
          </Button>
          <Button
            size="sm"
            onClick={() => setModal(true)}
            className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
          >
            <Plus className="h-4 w-4" />
            Registrar ingreso
          </Button>
        </div>
      </div>

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
          <Button size="sm" variant="outline" onClick={limpiarRango} className="gap-1.5 h-9">
            <X className="h-4 w-4" />
            Limpiar
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
            {tipos.filter((t) => t.activo).map((t) => (
              <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
            ))}
          </select>

          <select
            value={filtroMedio}
            onChange={(e) => setParam('medio', e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-azul"
          >
            <option value="">Todos los medios</option>
            {MEDIOS_PAGO.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={filtroOrigen}
            onChange={(e) => setParam('origen', e.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-azul"
          >
            <option value="">Todos los orígenes</option>
            <option value="auto">Automático</option>
            <option value="manual">Manual</option>
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

          {tienesFiltrosSecundarios && (
            <Button size="sm" variant="ghost" onClick={limpiarFiltros} className="h-8 gap-1 text-xs text-gray-500 px-2">
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
                <th className="px-4 py-3 font-semibold">Medio de pago</th>
                <th className="px-4 py-3 font-semibold">Origen</th>
                <th className="px-4 py-3 font-semibold text-right">Monto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : ingresos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    {filtroActivo && tienesFiltrosSecundarios
                      ? 'Sin resultados para esos filtros.'
                      : 'Sin ingresos registrados.'}
                  </td>
                </tr>
              ) : ingresos.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{resolverTipo(e.tipoIngresoCodigo)}</p>
                    {e.descripcion && (
                      <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.descripcion}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{e.fecha}</td>
                  <td className="px-4 py-3 text-gray-500">{e.medioPago ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <ArrowUpCircle className={cn('h-3.5 w-3.5', e.esAutomatico ? 'text-brand-azul' : 'text-gray-400')} />
                      {e.esAutomatico ? 'Automático' : 'Manual'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(e.monto)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDetailIngreso(e)}
                        className="p-1 text-gray-400 hover:text-brand-azul transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {!e.esAutomatico && (
                        <button
                          type="button"
                          onClick={() => eliminar.mutate(e.id)}
                          disabled={eliminar.isPending}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && totalResults > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t gap-4 flex-wrap">
            <p className="text-xs text-gray-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalResults)} de {totalResults} registros
            </p>
            {totalPagesDisplay > 1 && (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {getPageNums(page, totalPagesDisplay).map((n, i) =>
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
                <Button size="sm" variant="outline" disabled={page >= totalPagesDisplay - 1} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <Sheet open={openTipos} onOpenChange={setOpenTipos}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Tipos de ingreso</SheetTitle>
          </SheetHeader>
          <div className="px-1 py-4">
            <TiposIngresoManager />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!detailIngreso} onOpenChange={(o) => !o && setDetailIngreso(null)}>
        <SheetContent side="right" className="flex flex-col overflow-hidden sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalle del ingreso</SheetTitle>
            <SheetCloseButton />
          </SheetHeader>
          {detailIngreso && (
            <>
              <div className="shrink-0 bg-emerald-50 border-b border-emerald-100 px-5 py-5">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">
                  {resolverTipo(detailIngreso.tipoIngresoCodigo)}
                </p>
                <p className="text-3xl font-black text-emerald-700 tracking-tight">
                  {formatCurrency(detailIngreso.monto)}
                </p>
                <p className="text-sm text-emerald-600 mt-1.5">{formatFecha(detailIngreso.fecha)}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                <InfoRow label="Origen">
                  <span className={cn(
                    'inline-flex items-center gap-1.5 font-medium',
                    detailIngreso.esAutomatico ? 'text-brand-azul' : 'text-gray-700',
                  )}>
                    <ArrowUpCircle className="h-3.5 w-3.5" />
                    {detailIngreso.esAutomatico ? 'Automático' : 'Manual'}
                  </span>
                </InfoRow>

                {detailIngreso.medioPago && (
                  <InfoRow label="Medio de pago">
                    {MEDIOS_PAGO.find((m) => m.value === detailIngreso.medioPago)?.label
                      ?? detailIngreso.medioPago}
                  </InfoRow>
                )}

                {!detailIngreso.esAutomatico && detailIngreso.descripcion && (
                  <InfoRow label="Descripción">
                    {detailIngreso.descripcion}
                  </InfoRow>
                )}

                {(detailIngreso.idReservaPublica || detailIngreso.idEventoPrivado) && (
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 space-y-3">
                    {detailIngreso.idReservaPublica && (
                      <InfoRow label="Reserva pública">
                        <span className="font-semibold">N° {detailIngreso.idReservaPublica}</span>
                      </InfoRow>
                    )}
                    {detailIngreso.idEventoPrivado && (
                      <InfoRow label="Evento privado">
                        <span className="font-semibold">N° {detailIngreso.idEventoPrivado}</span>
                      </InfoRow>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Registrado el {new Date(detailIngreso.fechaCreacion).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={openModal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar ingreso manual</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Tipo de ingreso</Label>
              <select {...register('tipoIngresoCodigo')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                <option value="">Seleccionar…</option>
                {tipos.filter((t) => t.activo).map((t) => (
                  <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                ))}
              </select>
              {errors.tipoIngresoCodigo && <p className="text-xs text-red-500">{errors.tipoIngresoCodigo.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Monto (S/)</Label>
                <Input type="number" step="0.01" min="0" {...register('monto')} />
                {errors.monto && <p className="text-xs text-red-500">{errors.monto.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Fecha</Label>
                <Input type="date" {...register('fecha')} />
                {errors.fecha && <p className="text-xs text-red-500">{errors.fecha.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Medio de pago</Label>
              <select {...register('medioPago')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                <option value="">Sin especificar</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="YAPE">Yape</option>
                <option value="PLIN">Plin</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Descripción (opcional)</Label>
              <Input {...register('descripcion')} placeholder="Observaciones…" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={registrar.isPending} className="bg-brand-azul hover:bg-brand-azul/90 text-white">
                Registrar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

