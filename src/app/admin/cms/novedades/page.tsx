'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Newspaper,
  Home,
  Image as ImageIcon,
  Search,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import {
  useNovedadesAdmin,
  useNovedadMutations,
} from '@/features/admin/cms/novedades/hooks/useNovedades'
import { NovedadLocal } from '@/types/comercial.types'
import { fixMediaUrl } from '@/lib/media'
import { NovedadFormDialog } from '@/features/admin/cms/novedades/components/NovedadFormDialog'

export default function NovedadesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const formOpenParam = searchParams.get('open') === 'true'
  const editIdParam = searchParams.get('edit')

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const {
    data: novedades = [],
    isLoading,
    isError,
    refetch,
  } = useNovedadesAdmin()
  const { eliminar, toggleActivo } = useNovedadMutations()

  const editTarget = editIdParam
    ? (novedades.find((n) => n.id === Number(editIdParam)) ?? null)
    : null

  const formOpen = formOpenParam || !!editTarget
  const novedadesHome = novedades.filter(
    (n) => n.visibleHome && n.activa
  ).length

  function abrirCrear() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('open', 'true')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function abrirEditar(n: NovedadLocal) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit', n.id.toString())
    params.delete('open')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function cerrarDialog() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('open')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (isError) return <ErrorState onRetry={refetch} />

  const filteredNovedades = novedades.filter((n) => {
    return (
      n.titulo.toLowerCase().includes(query.toLowerCase()) ||
      n.descripcion.toLowerCase().includes(query.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Novedades' }]}
      />

      <PageHeader
        title="Novedades"
        description="Gestiona las novedades y noticias del sitio"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={abrirCrear}
          >
            <Plus className="h-4 w-4" /> Nueva novedad
          </Button>
        }
      />

      {novedades.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar novedad por título o descripción..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl"
            />
          </div>
          {!isLoading && (
            <p className="text-sm text-muted-foreground shrink-0">
              {filteredNovedades.length} novedades · {novedadesHome} en inicio
            </p>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && novedades.length === 0 && (
        <EmptyState
          title="Sin novedades"
          description="Crea la primera novedad para mostrarla en el sitio."
          icon={<Newspaper className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={abrirCrear}
            >
              <Plus className="h-4 w-4" /> Nueva novedad
            </Button>
          }
        />
      )}

      {!isLoading && novedades.length > 0 && filteredNovedades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100">
          <p className="text-sm font-medium text-gray-500">
            No se encontraron novedades que coincidan con la búsqueda.
          </p>
        </div>
      )}

      {!isLoading && filteredNovedades.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Novedad</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-left hidden md:table-cell">
                  Vigencia
                </th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredNovedades.map((n) => (
                <tr
                  key={n.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {n.imagenUrl ? (
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={fixMediaUrl(n.imagenUrl)}
                            alt={n.titulo}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {n.descripcion}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">
                    {n.prioridad}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {n.fechaInicio && n.fechaFin
                      ? `${n.fechaInicio} — ${n.fechaFin}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.visibleHome && (
                        <Badge className="bg-brand-azul/10 text-brand-azul text-xs h-5">
                          <Home className="h-3 w-3 mr-0.5" /> Inicio
                        </Badge>
                      )}
                      <QuickToggle
                        activo={n.activa}
                        onToggle={() => toggleActivo.mutate(n)}
                        isPending={
                          toggleActivo.isPending &&
                          (toggleActivo.variables as NovedadLocal)?.id === n.id
                        }
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => abrirEditar(n)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={() => setDeleteId(n.id)}
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

      <NovedadFormDialog
        key={editIdParam ?? (formOpenParam ? 'new' : 'none')}
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) cerrarDialog()
        }}
        novedad={editTarget}
        novedadesHome={novedadesHome}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar novedad"
        description="La novedad será eliminada permanentemente."
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
