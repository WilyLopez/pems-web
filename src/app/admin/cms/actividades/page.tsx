'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Zap,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import {
  useActividadesAdmin,
  useActividadMutations,
} from '@/features/admin/cms/actividades/hooks/useActividades'
import { ActividadLocal } from '@/types/comercial.types'
import { fixMediaUrl } from '@/lib/media'
import { ActividadFormDialog } from '@/features/admin/cms/actividades/components/ActividadFormDialog'

export default function ActividadesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ActividadLocal | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    data: actividades = [],
    isLoading,
    isError,
    refetch,
  } = useActividadesAdmin()
  const { eliminar, reordenar, toggleActivo } = useActividadMutations()

  const regulares = actividades.filter((a) => !a.esEspecial)
  const especiales = actividades.filter((a) => a.esEspecial)

  async function handleReordenar(
    lista: ActividadLocal[],
    id: number,
    dir: 'arriba' | 'abajo'
  ) {
    const sorted = [...lista].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex((a) => a.id === id)
    if (dir === 'arriba' && idx === 0) return
    if (dir === 'abajo' && idx === sorted.length - 1) return
    const otrIdx = dir === 'arriba' ? idx - 1 : idx + 1
    const actual = sorted[idx]
    const otro = sorted[otrIdx]
    try {
      await reordenar.mutateAsync({ id: actual.id, nuevoOrden: otro.orden })
      await reordenar.mutateAsync({ id: otro.id, nuevoOrden: actual.orden })
    } catch {
      toast.error('Error al reordenar')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  function renderTabla(lista: ActividadLocal[]) {
    if (lista.length === 0)
      return (
        <EmptyState
          title="Sin actividades"
          description="Crea la primera."
          icon={<Zap className="h-6 w-6" />}
        />
      )
    const sorted = [...lista].sort((a, b) => a.orden - b.orden)
    return (
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
              <th className="px-4 py-3 text-left">Actividad</th>
              <th className="px-4 py-3 text-left hidden sm:table-cell">Zona</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">
                Fechas
              </th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a, i) => (
              <tr
                key={a.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.imagenUrl ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={fixMediaUrl(a.imagenUrl)}
                          alt={a.nombre}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{a.nombre}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {a.descripcion}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {a.nombreZona ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {a.fechaInicio && a.fechaFin
                    ? `${a.fechaInicio} — ${a.fechaFin}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <QuickToggle
                    activo={a.activa}
                    onToggle={() => toggleActivo.mutate(a)}
                    isPending={
                      toggleActivo.isPending &&
                      (toggleActivo.variables as ActividadLocal)?.id === a.id
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={i === 0}
                      onClick={() => handleReordenar(lista, a.id, 'arriba')}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={i === sorted.length - 1}
                      onClick={() => handleReordenar(lista, a.id, 'abajo')}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setEditTarget(a)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 hover:text-destructive"
                      onClick={() => setDeleteId(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Actividades' }]}
      />

      <PageHeader
        title="Actividades"
        description="Gestiona las actividades regulares y especiales del local"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nueva actividad
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="regulares">
          <TabsList>
            <TabsTrigger value="regulares">
              Regulares
              {regulares.length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">
                  {regulares.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="especiales">
              Especiales
              {especiales.length > 0 && (
                <Badge variant="outline" className="ml-2 h-5 px-1.5 text-xs">
                  {especiales.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="regulares" className="mt-4">
            {renderTabla(regulares)}
          </TabsContent>
          <TabsContent value="especiales" className="mt-4">
            {renderTabla(especiales)}
          </TabsContent>
        </Tabs>
      )}

      <ActividadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        actividad={editTarget}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar actividad"
        description="La actividad será eliminada permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
