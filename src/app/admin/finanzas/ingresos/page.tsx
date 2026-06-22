'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight, X, ArrowUpCircle, Tag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import {
  useIngresos,
  useIngresoMutations,
  useTiposIngreso,
  ingresoManualSchema,
} from '@/features/admin/finance'
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
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type FormValues = z.infer<typeof ingresoManualSchema>

export default function IngresosPage() {
  const { idSede } = useAuth()
  const [page, setPage]         = useState(0)
  const [openModal, setModal]   = useState(false)
  const [inicio, setInicio]     = useState('')
  const [fin, setFin]           = useState('')

  const { data: paginado, isLoading } = useIngresos(idSede ?? undefined, page, 20)
  const { data: tipos = [] }          = useTiposIngreso()
  const { registrar, eliminar }       = useIngresoMutations()

  const ingresos   = paginado?.content ?? []
  const totalPages = paginado?.totalPages ?? 0

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Ingresos" description="Historial de ingresos registrados en la sede" />
        <div className="flex items-center gap-2">
          <Link href="/admin/finanzas/ingresos/tipos">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Tag className="h-4 w-4" />
              Ver tipos
            </Button>
          </Link>
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
          <Input type="date" value={inicio} onChange={(e) => { setInicio(e.target.value); setPage(0) }} className="h-9 w-40" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={fin}    onChange={(e) => { setFin(e.target.value);    setPage(0) }} className="h-9 w-40" />
        </div>
        {(inicio || fin) && (
          <Button size="sm" variant="outline" onClick={() => { setInicio(''); setFin(''); setPage(0) }} className="gap-1.5 h-9">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

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
                    Sin ingresos registrados.
                  </td>
                </tr>
              ) : ingresos.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{e.tipoIngresoCodigo}</p>
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
                    {!e.esAutomatico && (
                      <button
                        type="button"
                        onClick={() => eliminar.mutate(e.id)}
                        disabled={eliminar.isPending}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-gray-500">Página {page + 1} de {totalPages}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="h-7 w-7 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="h-7 w-7 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
