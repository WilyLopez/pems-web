'use client'

import { useState } from 'react'
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { DynamicIcon } from '@/components/admin/comercial/shared/IconPicker'
import { useTiposEventoAdmin, useTipoEventoMutations } from '@/features/admin/comercial/tipos-evento/hooks/useTiposEvento'
import { TipoEventoFormDialog } from '@/features/admin/comercial/tipos-evento/components/TipoEventoFormDialog'
import { TipoEvento } from '@/types/comercial.types'

export default function TiposEventoPage() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<TipoEvento | null>(null)
  const [deleteCodigo, setDeleteCodigo] = useState<string | null>(null)

  const { data: tipos = [], isLoading, isError, refetch } = useTiposEventoAdmin()
  const { eliminar, toggleActivo } = useTipoEventoMutations()

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Paquetes', href: '/admin/comercial/paquetes' },
        { label: 'Tipos de Evento' },
      ]} />

      <PageHeader
        title="Tipos de Evento"
        description="Catálogo de tipos de evento para clasificar los paquetes"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nuevo tipo
          </Button>
        }
      />

      {!isLoading && tipos.length > 0 && (
        <p className="text-sm text-muted-foreground">{tipos.length} tipos de evento</p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      )}

      {!isLoading && tipos.length === 0 && (
        <EmptyState
          title="Sin tipos de evento"
          description="Crea el primer tipo de evento para poder clasificar los paquetes."
          icon={<Tag className="h-6 w-6" />}
          action={
            <Button size="sm" className="bg-brand-azul text-white gap-1.5"
              onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" /> Nuevo tipo
            </Button>
          }
        />
      )}

      {!isLoading && tipos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Orden</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.codigo} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-brand-azul/10 text-brand-azul flex items-center justify-center shrink-0">
                        <DynamicIcon name={t.icono} className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{t.nombre}</p>
                        {t.descripcion && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{t.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{t.orden}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {t.esSistema && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs h-5">Sistema</Badge>
                      )}
                      <QuickToggle
                        activo={t.activo}
                        onToggle={() => !t.esSistema && toggleActivo.mutate(t)}
                        isPending={toggleActivo.isPending && (toggleActivo.variables as TipoEvento)?.codigo === t.codigo}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        disabled={t.esSistema}
                        onClick={() => { setEditTarget(t); setFormOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                        disabled={t.esSistema}
                        onClick={() => setDeleteCodigo(t.codigo)}>
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

      <TipoEventoFormDialog
        open={formOpen} onOpenChange={setFormOpen} tipoEvento={editTarget}
      />

      <ConfirmDialog
        open={deleteCodigo !== null}
        onOpenChange={(v) => !v && setDeleteCodigo(null)}
        title="Eliminar tipo de evento"
        description="Esta acción no se puede deshacer. No se podrá eliminar si hay paquetes asociados."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteCodigo !== null) eliminar.mutate(deleteCodigo, { onSettled: () => setDeleteCodigo(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
