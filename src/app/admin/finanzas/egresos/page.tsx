'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useEgresos, useEgresoMutations } from '@/hooks/useFinanzas'
import { RegistrarEgresoModal } from '@/components/admin/finanzas/RegistrarEgresoModal'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { CategoriaEgreso } from '@/types/finanzas.types'

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

export default function EgresosPage() {
  const { idSede } = useAuth()
  const [page, setPage] = useState(0)
  const [openModal, setOpenModal] = useState(false)

  const { data, isLoading } = useEgresos(idSede ?? undefined, page, 20)
  const { eliminar } = useEgresoMutations()

  const egresos = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader
          title="Egresos"
          description="Historial de egresos registrados en la sede"
        />
        <Button
          size="sm"
          onClick={() => setOpenModal(true)}
          className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Registrar egreso
        </Button>
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
                      <button
                        type="button"
                        onClick={() => eliminar.mutate(e.id)}
                        disabled={eliminar.isPending}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
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
          onOpenChange={setOpenModal}
          idSede={idSede}
        />
      )}
    </div>
  )
}
