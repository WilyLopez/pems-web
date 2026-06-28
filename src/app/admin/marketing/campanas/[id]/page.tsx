'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { marketingService } from '@/services/marketing.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EstadoCampanaBadge } from '@/components/admin/marketing/EstadoCampanaBadge'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { type EstadoEnvio } from '@/types/marketing.types'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ENVIO_CONFIG: Record<
  EstadoEnvio,
  { label: string; icon: LucideIcon; cls: string }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    icon: Clock,
    cls: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  ENVIADO: {
    label: 'Enviado',
    icon: CheckCircle,
    cls: 'bg-green-100 text-green-700 border-green-200',
  },
  ERROR: {
    label: 'Error',
    icon: AlertCircle,
    cls: 'bg-red-100 text-red-600 border-red-200',
  },
  REBOTADO: {
    label: 'Rebotado',
    icon: XCircle,
    cls: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  CANCELADO: {
    label: 'Cancelado',
    icon: XCircle,
    cls: 'bg-gray-100 text-gray-500 border-gray-200',
  },
}

function EstadoEnvioBadge({ estado }: { estado: EstadoEnvio }) {
  const cfg = ENVIO_CONFIG[estado] ?? ENVIO_CONFIG.PENDIENTE
  const Icon = cfg.icon
  return (
    <Badge
      variant="outline"
      className={cn('gap-1 text-xs font-semibold', cfg.cls)}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

export default function CampanaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const campanaId = Number(id)
  const [page, setPage] = useState(0)

  const { data: campana, isLoading: loadingCampana } = useQuery({
    queryKey: ['campana', campanaId],
    queryFn: () => marketingService.getCampanaById(campanaId),
    enabled: !!campanaId,
  })

  const { data: envios, isLoading: loadingEnvios } = useQuery({
    queryKey: ['envios', campanaId, page],
    queryFn: () => marketingService.listarEnvios(campanaId, page, 20),
    enabled: !!campanaId,
  })

  const totalEnviados = campana?.totalEnviados ?? 0
  const totalDestinatarios = campana?.totalDestinatarios ?? 0
  const porcentaje =
    totalDestinatarios > 0
      ? Math.round((totalEnviados / totalDestinatarios) * 100)
      : 0

  if (loadingCampana) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Campañas', href: '/admin/marketing/campanas' },
          { label: campana?.nombre ?? `Campaña #${campanaId}` },
        ]}
      />

      {campana && (
        <>
          <PageHeader
            title={campana.nombre}
            description={
              campana.descripcion ?? `Plantilla: ${campana.plantillaNombre}`
            }
            actions={<EstadoCampanaBadge estado={campana.estado} />}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: 'Destinatarios',
                value: campana.totalDestinatarios,
                icon: Mail,
                color: 'bg-brand-azul/10 text-brand-azul',
              },
              {
                label: 'Enviados',
                value: campana.totalEnviados,
                icon: Send,
                color: 'bg-emerald-100 text-emerald-700',
              },
              {
                label: 'Fallidos',
                value: campana.totalFallidos,
                icon: XCircle,
                color: 'bg-red-100 text-red-600',
              },
              {
                label: 'Progreso',
                value: `${porcentaje}%`,
                icon: CheckCircle,
                color: 'bg-amber-100 text-amber-700',
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3"
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {totalDestinatarios > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Progreso de envío
                </span>
                <span className="text-sm font-bold text-brand-azul">
                  {porcentaje}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-azul rounded-full transition-all"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                <span>{campana.totalEnviados} enviados</span>
                <span>{campana.totalFallidos} fallidos</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Registro de envíos</h3>
        </div>

        {loadingEnvios ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
          </div>
        ) : !envios?.content.length ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No hay envíos registrados aún.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  'Destinatario',
                  'Asunto',
                  'Estado',
                  'Intentos',
                  'Fecha envío',
                  'Error',
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
              {envios.content.map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {e.destinatario}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                    {e.asunto}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoEnvioBadge estado={e.estado} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {e.intentos}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {e.fechaEnvio ? formatDate(e.fechaEnvio) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-red-500 max-w-[160px] truncate">
                    {e.mensajeError ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {envios && envios.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {envios.totalElements} envío{envios.totalElements !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={envios.first}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {envios.page + 1} / {envios.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={envios.last}
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
