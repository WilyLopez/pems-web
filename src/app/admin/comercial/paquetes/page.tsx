'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Package2,
  Tag,
  Check,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import {
  usePaquetesAdmin,
  usePaqueteMutations,
} from '@/features/admin/comercial/paquetes/hooks/usePaquetes'
import { PaqueteEvento } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'
import { fixMediaUrl } from '@/lib/media'
import { PaqueteFormDialog } from '@/features/admin/comercial/paquetes/components/PaqueteFormDialog'
import { PaqueteDetailDialog } from '@/features/admin/comercial/paquetes/components/PaqueteDetailDialog'

export default function PaquetesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PaqueteEvento | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<PaqueteEvento | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaqueteEvento | null>(null)

  const {
    data: paquetes = [],
    isLoading,
    isError,
    refetch,
  } = usePaquetesAdmin()
  const { eliminar, reordenar, toggleActivo } = usePaqueteMutations()

  async function handleReordenar(id: number, dir: 'arriba' | 'abajo') {
    const sorted = [...paquetes].sort((a, b) => a.orden - b.orden)
    const idx = sorted.findIndex((p) => p.id === id)
    if (dir === 'arriba' && idx === 0) return
    if (dir === 'abajo' && idx === sorted.length - 1) return
    const otrIdx = dir === 'arriba' ? idx - 1 : idx + 1
    const otro = sorted[otrIdx]
    try {
      await reordenar.mutateAsync({ id, nuevoOrden: otro.orden })
    } catch {
      toast.error('Error al reordenar')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Comercial', href: '/admin/comercial' },
          { label: 'Paquetes' },
        ]}
      />

      <PageHeader
        title="Paquetes de eventos"
        description="Crea y administra los paquetes disponibles para contratar"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href="/admin/comercial/paquetes/tipos-evento">
                <Tag className="h-4 w-4" /> Tipos de Evento
              </Link>
            </Button>
            <Button
              size="sm"
              className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo paquete
            </Button>
          </div>
        }
      />

      {!isLoading && paquetes.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {paquetes.length} paquetes · {paquetes.filter((p) => p.activo).length}{' '}
          activos
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && paquetes.length === 0 && (
        <EmptyState
          title="Sin paquetes"
          description="Crea el primer paquete para ofrecerlo en el sitio."
          icon={<Package2 className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo paquete
            </Button>
          }
        />
      )}

      {!isLoading && paquetes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...paquetes]
            .sort((a, b) => a.orden - b.orden)
            .map((p, i, sorted) => (
              <Card
                key={p.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-md border-gray-200 flex flex-col"
              >
                <div
                  className="h-1.5 w-full shrink-0"
                  style={{ backgroundColor: p.color ?? '#00AEEF' }}
                />
                {p.imagenUrl ? (
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={fixMediaUrl(p.imagenUrl)}
                      alt={p.nombre}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized
                    />
                    {p.badge && (
                      <span
                        className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
                        style={{ backgroundColor: p.color ?? '#EC4899' }}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    className="aspect-[4/3] flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:brightness-95"
                    style={{
                      background: `linear-gradient(135deg, ${p.color ?? '#00AEEF'} 0%, ${p.color ? p.color + 'aa' : '#EC4899'} 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:16px_16px]" />
                    <Package2
                      className="h-12 w-12 text-white/70 relative z-10 animate-pulse"
                      style={{ animationDuration: '3s' }}
                    />
                    {p.badge && (
                      <span className="absolute top-2 left-2 bg-white/90 text-gray-900 border border-gray-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {p.badge}
                      </span>
                    )}
                  </div>
                )}
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{p.nombre}</h3>
                        <p
                          className="text-lg font-bold"
                          style={{ color: p.color ?? '#00AEEF' }}
                        >
                          {formatCurrency(p.precio)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <QuickToggle
                          activo={p.activo}
                          onToggle={() => toggleActivo.mutate(p)}
                          isPending={
                            toggleActivo.isPending &&
                            (toggleActivo.variables as PaqueteEvento)?.id ===
                              p.id
                          }
                        />
                        {p.destacado && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            Destacado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {p.tipoEventoCodigo && (
                      <Badge
                        className="text-xs h-5 border-0 font-medium"
                        style={{
                          backgroundColor: `${p.color ?? '#00AEEF'}15`,
                          color: p.color ?? '#00AEEF',
                        }}
                      >
                        {p.tipoEventoCodigo}
                      </Badge>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.descripcionCorta}
                    </p>

                    <div className="space-y-1.5">
                      {(p.beneficios ?? []).slice(0, 3).map((b, j) => (
                        <div
                          key={j}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: `${p.color ?? '#00AEEF'}15`,
                            }}
                          >
                            <Check
                              className="h-2.5 w-2.5"
                              style={{ color: p.color ?? '#00AEEF' }}
                            />
                          </div>
                          <span className="line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-1 border-t flex-wrap">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => {
                        setDetailTarget(p)
                        setDetailOpen(true)
                      }}
                    >
                      <Eye className="h-3 w-3" /> Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => {
                        setEditTarget(p)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={i === 0 || reordenar.isPending}
                      onClick={() => handleReordenar(p.id, 'arriba')}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      disabled={i === sorted.length - 1 || reordenar.isPending}
                      onClick={() => handleReordenar(p.id, 'abajo')}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 ml-auto hover:text-destructive"
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      <PaqueteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        paquete={editTarget}
      />

      <PaqueteDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        paquete={detailTarget}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Eliminar paquete"
        description={
          deleteTarget
            ? `¿Deseas eliminar el paquete "${deleteTarget.nombre}"?`
            : 'El paquete será eliminado permanentemente.'
        }
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteTarget !== null)
            eliminar.mutate(deleteTarget.id, {
              onSettled: () => setDeleteTarget(null),
            })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
