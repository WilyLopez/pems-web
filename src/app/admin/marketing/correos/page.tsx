'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw, Loader2, ChevronLeft, ChevronRight, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import {
  useCorreosMarketing,
  useToggleCorreo,
  useEliminarCorreo,
} from '@/hooks/useMarketingEmails'

export default function CorreosPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading, refetch } = useCorreosMarketing(page, 15)
  const toggle = useToggleCorreo()
  const eliminar = useEliminarCorreo()

  function handleEliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar el correo "${nombre}"? Esta acción no se puede deshacer.`)) return
    eliminar.mutate(id)
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Correos' },
        ]}
      />

      <PageHeader
        title="Correos de marketing"
        description="Gestiona las plantillas de correo para campañas y comunicaciones comerciales"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/admin/marketing/correos/nuevo">
              <Button size="sm" className="rounded-xl gap-1.5">
                <Plus className="h-4 w-4" />
                Nuevo correo
              </Button>
            </Link>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
          </div>
        ) : !data?.content.length ? (
          <div className="p-12 text-center text-sm text-gray-400">
            No hay correos de marketing. ¡Crea el primero!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Nombre', 'Tipo', 'Estado', 'Actualizado', ''].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.content.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-gray-900">{c.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.asunto}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">{c.tipoEmailNombre}</td>
                  <td className="px-4 py-3.5">
                    {c.activa ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[11px]">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[11px]">
                        Inactivo
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {formatDate(c.fechaActualizacion)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        title={c.activa ? 'Desactivar' : 'Activar'}
                        onClick={() => toggle.mutate({ id: c.id, activa: !c.activa })}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {c.activa ? (
                          <ToggleRight className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <Link href={`/admin/marketing/correos/${c.id}`}>
                        <button
                          type="button"
                          title="Editar"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        title="Eliminar"
                        onClick={() => handleEliminar(c.id, c.nombre)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {data.totalElements} correo{data.totalElements !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.first}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {data.page + 1} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
