'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import {
  BLOQUES,
  SECCIONES,
  Bloque,
} from '@/features/admin/cms/contenido/config/bloques'
import { useContenidoMapa } from '@/features/admin/cms/contenido/hooks/useContenidoBloques'
import { BloqueCard } from '@/features/admin/cms/contenido/components/BloqueCard'
import { BloqueEditorDialog } from '@/features/admin/cms/contenido/components/BloqueEditorDialog'
import { BloqueListaEditorDialog } from '@/features/admin/cms/contenido/components/BloqueListaEditorDialog'
import { BloqueReglasEditorDialog } from '@/features/admin/cms/contenido/components/BloqueReglasEditorDialog'

export default function ContenidoWebPage() {
  const [seccion, setSeccion] = useState(SECCIONES[0].codigo)
  const [bloqueEditar, setBloqueEditar] = useState<Bloque | null>(null)

  const { mapa, isLoading, isError, refetch } = useContenidoMapa()

  const bloques = BLOQUES.filter((b) => b.seccion === seccion)

  const chipClase = (activo: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
      activo
        ? 'border-brand-azul/40 bg-brand-azul/10 text-brand-azul'
        : 'border-transparent bg-muted text-muted-foreground hover:bg-muted/80'
    }`

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Contenido Web' },
        ]}
      />

      <PageHeader
        title="Contenido Web"
        description="Edita los textos que ve el público en cada sección"
      />

      <div className="flex flex-wrap items-center gap-2">
        {SECCIONES.map((s) => (
          <button
            key={s.codigo}
            type="button"
            onClick={() => setSeccion(s.codigo)}
            className={chipClase(seccion === s.codigo)}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      {isError && <ErrorState onRetry={refetch} />}

      {isLoading && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-4 lg:grid-cols-2">
          {bloques.map((bloque) => (
            <BloqueCard
              key={bloque.id}
              bloque={bloque}
              mapa={mapa}
              onEditar={() => setBloqueEditar(bloque)}
            />
          ))}
        </div>
      )}

      {bloqueEditar &&
        (bloqueEditar.tipo === 'lista' ? (
          <BloqueListaEditorDialog
            bloque={bloqueEditar}
            mapa={mapa}
            open
            onOpenChange={(v) => !v && setBloqueEditar(null)}
          />
        ) : bloqueEditar.tipo === 'lista-texto' ? (
          <BloqueReglasEditorDialog
            bloque={bloqueEditar}
            mapa={mapa}
            open
            onOpenChange={(v) => !v && setBloqueEditar(null)}
          />
        ) : (
          <BloqueEditorDialog
            bloque={bloqueEditar}
            mapa={mapa}
            open
            onOpenChange={(v) => !v && setBloqueEditar(null)}
          />
        ))}
    </div>
  )
}
