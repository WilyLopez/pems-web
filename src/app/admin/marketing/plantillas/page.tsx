'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Loader2, FileText } from 'lucide-react'

import { marketingService } from '@/services/marketing.service'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { CrearPlantillaDialog } from '@/components/admin/marketing/CrearPlantillaDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default function PlantillasPage() {
  const [crearOpen, setCrearOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: plantillas, isLoading, refetch } = useQuery({
    queryKey: ['plantillas'],
    queryFn: () => marketingService.listarPlantillas(0, 50),
  })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['plantillas'] })

  return (
    <div className="space-y-5">
      <Breadcrumbs
        items={[
          { label: 'Marketing', href: '/admin/marketing' },
          { label: 'Plantillas' },
        ]}
      />

      <PageHeader
        title="Plantillas de email"
        description="Diseña las plantillas HTML que usarán tus campañas"
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
              Nueva plantilla
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
        </div>
      ) : !plantillas?.length ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No hay plantillas creadas. ¡Crea la primera!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-9 h-9 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-brand-azul" />
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wide"
                >
                  {p.tipoEmailCodigo}
                </Badge>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 truncate">{p.nombre}</h3>
                <p className="text-sm text-gray-500 truncate mt-0.5">{p.asunto}</p>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span
                  className={`text-[11px] font-semibold ${
                    p.activa ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {p.activa ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {formatDate(p.fechaActualizacion)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CrearPlantillaDialog
        open={crearOpen}
        onClose={() => setCrearOpen(false)}
        onCreated={invalidar}
      />
    </div>
  )
}
