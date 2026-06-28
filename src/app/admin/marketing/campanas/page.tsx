'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Send,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'

import { marketingService } from '@/services/marketing.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EstadoCampanaBadge } from '@/components/admin/marketing/EstadoCampanaBadge'
import { CrearCampanaDialog } from '@/components/admin/marketing/CrearCampanaDialog'
import { EnviarCampanaDialog } from '@/components/admin/marketing/EnviarCampanaDialog'
import { Button } from '@/components/ui/Button'
import { CampanaEmail } from '@/types/marketing.types'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function CampanasPage() {
  const [page, setPage] = useState(0)
  const [crearOpen, setCrearOpen] = useState(false)
  const [enviarCampana, setEnviarCampana] = useState<CampanaEmail | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['campanas', page],
    queryFn: () => marketingService.listarCampanas(page, 15),
  })

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['campanas'] })

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Campañas' },
        ]}
      />

      <PageHeader
        title="Campañas de email"
        description="Crea, programa y monitorea tus campañas de correo masivo"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="rounded-xl gap-1.5"
              onClick={() => setCrearOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nueva campaña
            </Button>
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
            No hay campañas creadas. ¡Crea la primera!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  'Nombre',
                  'Plantilla',
                  'Estado',
                  'Destinatarios',
                  'Enviados',
                  'Fallidos',
                  'Programada',
                  '',
                ].map((h) => (
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
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3.5 font-semibold text-gray-900">
                    {c.nombre}
                    {c.descripcion && (
                      <p className="text-xs text-gray-400 font-normal">
                        {c.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 text-xs">
                    {c.plantillaNombre}
                  </td>
                  <td className="px-4 py-3.5">
                    <EstadoCampanaBadge estado={c.estado} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 font-medium">
                    {c.totalDestinatarios}
                  </td>
                  <td className="px-4 py-3.5 text-emerald-700 font-medium">
                    {c.totalEnviados}
                  </td>
                  <td className="px-4 py-3.5 text-red-600 font-medium">
                    {c.totalFallidos}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {c.fechaProgramada ? formatDate(c.fechaProgramada) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {(c.estado === 'BORRADOR' ||
                        c.estado === 'PROGRAMADA') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg gap-1 text-xs border-brand-azul/30 text-brand-azul hover:bg-brand-azul/8"
                          onClick={() => setEnviarCampana(c)}
                        >
                          <Send className="h-3 w-3" />
                          Enviar
                        </Button>
                      )}
                      <Link href={`/admin/marketing/campanas/${c.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg gap-1 text-xs text-gray-500"
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </Button>
                      </Link>
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
            {data.totalElements} campaña{data.totalElements !== 1 ? 's' : ''}
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

      <CrearCampanaDialog
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onCreated={invalidar}
      />

      <EnviarCampanaDialog
        campana={enviarCampana}
        onClose={() => setEnviarCampana(null)}
        onSent={invalidar}
      />
    </div>
  )
}
