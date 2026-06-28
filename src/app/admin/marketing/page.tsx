'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Mail, Send, FileText, XCircle, Settings2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

import { marketingService } from '@/services/marketing.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { EstadoCampanaBadge } from '@/components/admin/marketing/EstadoCampanaBadge'
import { TiposEmailModal } from '@/components/admin/marketing/TiposEmailModal'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color: string
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          color
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : content
}

export default function MarketingPage() {
  const [tiposOpen, setTiposOpen] = useState(false)

  const { data: campanas } = useQuery({
    queryKey: ['campanas', 0],
    queryFn: () => marketingService.listarCampanas(0, 5),
  })

  const { data: plantillas } = useQuery({
    queryKey: ['plantillas'],
    queryFn: () => marketingService.listarPlantillas(0, 100),
  })

  const totalEnviados =
    campanas?.content.reduce((s, c) => s + c.totalEnviados, 0) ?? 0
  const totalFallidos =
    campanas?.content.reduce((s, c) => s + c.totalFallidos, 0) ?? 0

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ label: 'Marketing' }]} />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <PageHeader
          title="Email Marketing"
          description="Gestión de campañas, plantillas y envíos masivos"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTiposOpen(true)}
          className="gap-1.5 shrink-0"
        >
          <Settings2 className="h-4 w-4" />
          Tipos de correo
        </Button>
      </div>

      <TiposEmailModal open={tiposOpen} onOpenChange={setTiposOpen} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Mail}
          label="Campañas"
          value={campanas?.totalElements ?? 0}
          color="bg-brand-azul/10 text-brand-azul"
          href="/admin/marketing/campanas"
        />
        <MetricCard
          icon={FileText}
          label="Plantillas"
          value={plantillas?.length ?? '—'}
          color="bg-brand-rosa/10 text-brand-rosa"
          href="/admin/marketing/plantillas"
        />
        <MetricCard
          icon={Send}
          label="Correos enviados"
          value={totalEnviados}
          color="bg-emerald-100 text-emerald-700"
        />
        <MetricCard
          icon={XCircle}
          label="Fallidos"
          value={totalFallidos}
          color="bg-red-100 text-red-600"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Últimas campañas</h3>
          <Link
            href="/admin/marketing/campanas"
            className="text-xs text-brand-azul font-semibold hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {!campanas?.content.length ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No hay campañas creadas aún.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {campanas.content.map((c) => (
              <div
                key={c.id}
                className="px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {c.nombre}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(c.fechaCreacion)}
                    {c.fechaProgramada && (
                      <> · Programada: {formatDate(c.fechaProgramada)}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {c.totalEnviados}
                      <span className="text-gray-400 font-normal">
                        /{c.totalDestinatarios}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">enviados</p>
                  </div>
                  <EstadoCampanaBadge estado={c.estado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/marketing/campanas">
          <div className="bg-brand-azul rounded-2xl p-5 text-white hover:bg-brand-azul/90 transition-colors flex items-center gap-4">
            <Send className="h-8 w-8 opacity-80" />
            <div>
              <p className="font-bold">Nueva campaña</p>
              <p className="text-sm opacity-75">
                Crea y programa envíos masivos
              </p>
            </div>
          </div>
        </Link>
        <Link href="/admin/marketing/plantillas">
          <div className="bg-brand-rosa rounded-2xl p-5 text-white hover:bg-brand-rosa/90 transition-colors flex items-center gap-4">
            <FileText className="h-8 w-8 opacity-80" />
            <div>
              <p className="font-bold">Plantillas de correo</p>
              <p className="text-sm opacity-75">Diseña tus templates HTML</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
