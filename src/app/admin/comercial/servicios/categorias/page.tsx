'use client'

import { useState } from 'react'
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import {
  useCategoriasServicioAdmin,
  useCategoriaServicioMutations,
} from '@/features/admin/comercial/servicios/hooks/useCategoriasServicio'
import { CategoriaServicioFormDialog } from '@/features/admin/comercial/servicios/components/CategoriaServicioFormDialog'
import { CategoriaServicio } from '@/types/comercial.types'

export default function CategoriasServicioPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<CategoriaServicio | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    data: categorias = [],
    isLoading,
    isError,
    refetch,
  } = useCategoriasServicioAdmin()
  const { eliminar, toggleActivo } = useCategoriaServicioMutations()

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Comercial', href: '/admin/comercial' },
          { label: 'Servicios', href: '/admin/comercial/servicios' },
          { label: 'Categorías' },
        ]}
      />

      <PageHeader
        title="Categorías de Servicio"
        description="Catálogo de categorías para clasificar los servicios de cotización"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nueva categoría
          </Button>
        }
      />

      {!isLoading && categorias.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {categorias.length} categorías
        </p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && categorias.length === 0 && (
        <EmptyState
          title="Sin categorías"
          description="Crea la primera categoría para poder clasificar los servicios."
          icon={<Tag className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nueva categoría
            </Button>
          }
        />
      )}

      {!isLoading && categorias.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  Orden
                </th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.nombre}</p>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">
                    {c.orden}
                  </td>
                  <td className="px-4 py-3">
                    <QuickToggle
                      activo={c.activo}
                      onToggle={() => toggleActivo.mutate(c)}
                      isPending={
                        toggleActivo.isPending &&
                        (toggleActivo.variables as CategoriaServicio)?.id ===
                          c.id
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditTarget(c)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={() => setDeleteId(c.id)}
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
      )}

      <CategoriaServicioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categoria={editTarget}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar categoría"
        description="Esta acción no se puede deshacer. No se podrá eliminar si hay servicios asociados."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, {
              onSettled: () => setDeleteId(null),
            })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
