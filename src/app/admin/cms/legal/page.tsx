'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { LegalNuevoDocumentoModal } from '@/components/admin/legal/LegalNuevoDocumentoModal'
import {
  useContenidoLegalAdmin,
  useTiposLegal,
  useToggleLegal,
  useEliminarContenidoLegal,
} from '@/features/admin/cms/legal/hooks/useContenidoLegal'
import {
  LegalNavSidebar,
  LegalNavItem,
} from '@/features/admin/cms/legal/components/LegalNavSidebar'
import { LegalEditorSection } from '@/features/admin/cms/legal/components/LegalEditorSection'

export default function LegalPage() {
  const { data: todos, isLoading } = useContenidoLegalAdmin()
  const { data: catalogo } = useTiposLegal()
  const toggle = useToggleLegal()
  const eliminar = useEliminarContenidoLegal()

  const tipos: LegalNavItem[] =
    todos?.map((d) => {
      const cat = catalogo?.find((c) => c.codigo === d.tipo)
      return {
        tipo: d.tipo,
        etiqueta: cat?.etiqueta ?? d.tipo,
        activo: d.activo,
        esSistema: cat?.esSistema ?? false,
        requerido: cat?.requerido ?? false,
      }
    }) ?? []

  const [tipoActivo, setTipoActivo] = useState('TERMINOS')
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [tipoAEliminar, setTipoAEliminar] = useState<string | null>(null)

  useEffect(() => {
    if (
      todos &&
      todos.length > 0 &&
      !todos.find((d) => d.tipo === tipoActivo)
    ) {
      setTipoActivo(todos[0].tipo)
    }
  }, [todos, tipoActivo])

  return (
    <div className="flex flex-col h-full space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Contenido Legal' },
        ]}
      />

      <PageHeader
        title="Contenido Legal"
        description="Gestiona los documentos legales del sitio. Cada guardado crea una nueva versión."
      />

      <div
        className="flex-1 rounded-xl border bg-background overflow-hidden flex min-h-0"
        style={{ minHeight: '600px' }}
      >
        {isLoading ? (
          <div className="flex-1 p-6 space-y-3">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <>
            <LegalNavSidebar
              tipos={tipos}
              tipoActivo={tipoActivo}
              onSelect={setTipoActivo}
              onNuevo={() => setModalNuevoAbierto(true)}
              onToggle={(tipo, activo) => toggle.mutate({ tipo, activo })}
              onEliminar={(tipo) => setTipoAEliminar(tipo)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {todos?.find((d) => d.tipo === tipoActivo) !== undefined ||
              true ? (
                <LegalEditorSection key={tipoActivo} tipo={tipoActivo} />
              ) : null}
            </div>
          </>
        )}
      </div>

      <LegalNuevoDocumentoModal
        open={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        onCreado={(tipo) => setTipoActivo(tipo)}
      />

      <ConfirmDialog
        open={!!tipoAEliminar}
        onOpenChange={(v) => !v && setTipoAEliminar(null)}
        title="Eliminar documento"
        description={`¿Eliminar el documento "${
          tipoAEliminar
            ? (tipos.find((t) => t.tipo === tipoAEliminar)?.etiqueta ??
              tipoAEliminar)
            : ''
        }"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={eliminar.isPending}
        onConfirm={() => {
          if (tipoAEliminar) {
            eliminar.mutate(tipoAEliminar, {
              onSuccess: () => setTipoAEliminar(null),
            })
          }
        }}
      />
    </div>
  )
}
