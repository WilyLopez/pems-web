'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Image as ImageIcon,
  Star,
  Search,
} from 'lucide-react'
import Image from 'next/image'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import {
  useZonasAdmin,
  useZonaMutations,
} from '@/features/admin/cms/zonas/hooks/useZonas'
import { ZonaJuego } from '@/types/comercial.types'
import { fixMediaUrl } from '@/lib/media'
import { ZonaFormDialog } from './ZonaFormDialog'

export function ZonasClient() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ZonaJuego | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const { data: zonas = [], isLoading, isError, refetch } = useZonasAdmin()
  const { eliminar, toggleActivo } = useZonaMutations()

  const filtered = search.trim()
    ? zonas.filter(
        (z) =>
          z.nombre.toLowerCase().includes(search.toLowerCase()) ||
          z.descripcion.toLowerCase().includes(search.toLowerCase())
      )
    : zonas

  if (isError) return <ErrorState onRetry={refetch} />

  const tableHeader = (
    <thead>
      <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
        <th className="px-4 py-3 text-left">Zona</th>
        <th className="px-4 py-3 text-left hidden sm:table-cell">Rango edad</th>
        <th className="px-4 py-3 text-center hidden md:table-cell">Imágenes</th>
        <th className="px-4 py-3 text-center hidden md:table-cell">Videos</th>
        <th className="px-4 py-3 text-center hidden lg:table-cell">Orden</th>
        <th className="px-4 py-3 text-left">Estado</th>
        <th className="px-4 py-3 text-right">Acciones</th>
      </tr>
    </thead>
  )

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Zonas' }]}
      />

      <PageHeader
        title="Zonas de juego"
        description="Administra las zonas del local"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Nueva zona
          </Button>
        }
      />

      {!isLoading && zonas.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="pl-9"
          />
        </div>
      )}

      {isLoading && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            {tableHeader}
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-44" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Skeleton className="h-3.5 w-16" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Skeleton className="h-3.5 w-6 mx-auto" />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Skeleton className="h-3.5 w-6 mx-auto" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Skeleton className="h-5 w-5 rounded-full mx-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && zonas.length === 0 && (
        <EmptyState
          title="Sin zonas"
          description="Crea la primera zona de juego."
          icon={<MapPin className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nueva zona
            </Button>
          }
        />
      )}

      {!isLoading &&
        zonas.length > 0 &&
        (filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Sin resultados para &ldquo;{search}&rdquo;
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              {tableHeader}
              <tbody>
                {filtered.map((z) => {
                  const isDeleting =
                    eliminar.isPending && eliminar.variables === z.id
                  return (
                    <tr
                      key={z.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {z.imagenes.length > 0 ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={fixMediaUrl(z.imagenes[0])}
                                alt={z.nombre}
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
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium">{z.nombre}</p>
                              {z.destacada && (
                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {z.descripcion}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                        {z.edadMinima != null && z.edadMaxima != null
                          ? `${z.edadMinima}–${z.edadMaxima} años`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {z.imagenes.length}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell">
                        {z.videos.length}
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium tabular-nums">
                          {z.orden}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <QuickToggle
                          activo={z.activa}
                          onToggle={() => toggleActivo.mutate(z)}
                          isPending={
                            toggleActivo.isPending &&
                            (toggleActivo.variables as ZonaJuego)?.id === z.id
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            disabled={isDeleting}
                            onClick={() => {
                              setEditTarget(z)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:text-destructive"
                            disabled={isDeleting}
                            onClick={() => setDeleteId(z.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}

      <ZonaFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        zona={editTarget}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar zona"
        description="La zona y todos sus medios serán eliminados permanentemente."
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
