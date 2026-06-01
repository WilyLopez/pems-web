'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronLeft, ChevronRight, Pencil, X, Tag } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEgresos, useEgresosPorRango, useEgresoMutations } from '@/hooks/useFinanzas'
import { RegistrarEgresoModal } from '@/components/admin/finanzas/RegistrarEgresoModal'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CategoriaEgreso, RegistroEgreso } from '@/types/finanzas.types'

const categoriaBadge: Record<CategoriaEgreso, string> = {
  RECURRENTE_FIJO: 'bg-blue-100 text-blue-700',
  RECURRENTE_VARIABLE: 'bg-yellow-100 text-yellow-700',
  EVENTUAL: 'bg-gray-100 text-gray-600',
}

const categoriaLabel: Record<CategoriaEgreso, string> = {
  RECURRENTE_FIJO: 'Fijo',
  RECURRENTE_VARIABLE: 'Variable',
  EVENTUAL: 'Eventual',
}

function useEgresosPorRangoHook(
  idSede: number | undefined,
  inicio: string,
  fin: string
) {
  return useEgresosPorRango(
    idSede,
    inicio || undefined,
    fin || undefined
  )
}

export default function EgresosPage() {
  const { idSede } = useAuth()
  const [page, setPage] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [editandoEgreso, setEditandoEgreso] = useState<RegistroEgreso | undefined>()
  const [inicio, setInicio] = useState('')
  const [fin, setFin] = useState('')

  const filtroActivo = !!inicio && !!fin

  const { data: paginado, isLoading: loadingPag } = useEgresos(
    filtroActivo ? undefined : idSede ?? undefined,
    page,
    20
  )
  const { data: rangeLista = [], isLoading: loadingRango } = useEgresosPorRangoHook(
    filtroActivo ? idSede ?? undefined : undefined,
    inicio,
    fin
  )

  const { eliminar } = useEgresoMutations()

  const egresos = filtroActivo ? rangeLista : (paginado?.content ?? [])
  const totalPages = filtroActivo ? 0 : (paginado?.totalPages ?? 0)
  const isLoading = filtroActivo ? loadingRango : loadingPag

  function abrirNuevo() {
    setEditandoEgreso(undefined)
    setOpenModal(true)
  }

  function abrirEditar(e: RegistroEgreso) {
    setEditandoEgreso(e)
    setOpenModal(true)
  }

  function limpiarFiltro() {
    setInicio('')
    setFin('')
    setPage(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader
          title="Egresos"
          description="Historial de egresos registrados en la sede"
        />
        <div className="flex items-center gap-2">
          <Link href="/admin/finanzas/tipos-egreso">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Tag className="h-4 w-4" />
              Ver tipos
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={abrirNuevo}
            className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
          >
            <Plus className="h-4 w-4" />
            Registrar egreso
          </Button>
        </div>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-xs">Desde</Label>
          <Input
            type="date"
            value={inicio}
            onChange={(e) => { setInicio(e.target.value); setPage(0) }}
            className="h-9 w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Hasta</Label>
          <Input
            type="date"
            value={fin}
            onChange={(e) => { setFin(e.target.value); setPage(0) }}
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

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Categoria</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 font-semibold text-right">Monto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : egresos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-400">
                    Sin egresos registrados.
                  </td>
                </tr>
              ) : (
                egresos.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{e.nombreTipoEgreso}</p>
                      {e.descripcion && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{e.descripcion}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                          categoriaBadge[e.categoriaEgreso]
                        )}
                      >
                        {categoriaLabel[e.categoriaEgreso]}
                      </span>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => abrirEditar(e)}
                          className="text-gray-400 hover:text-brand-azul transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar.mutate(e.id)}
                          disabled={eliminar.isPending}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!filtroActivo && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-gray-500">
              Pagina {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
