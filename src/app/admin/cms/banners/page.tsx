'use client'

import { useState } from 'react'
import {
  Plus,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { BannerFormDialog } from '@/components/admin/cms/BannerFormDialog'
import {
  useBanners,
  useCrearBanner,
  useActualizarBanner,
  useToggleBanner,
  useDuplicarBanner,
  useEliminarBanner,
  useReordenarBanners,
} from '@/hooks/useBanners'
import { Banner } from '@/types/banner.types'
import {
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/types/banner.types'

function BannerCard({
  banner,
  index,
  total,
  loadingId,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  banner: Banner
  index: number
  total: number
  loadingId: number | null
  onEdit: (b: Banner) => void
  onToggle: (b: Banner) => void
  onDuplicate: (id: number) => void
  onDelete: (id: number) => void
  onMoveUp: (i: number) => void
  onMoveDown: (i: number) => void
}) {
  const isBusy = loadingId === banner.id
  const today = new Date().toISOString().split('T')[0]
  const isVigente =
    banner.activo &&
    banner.fechaInicio <= today &&
    (!banner.fechaFin || banner.fechaFin >= today)

  return (
    <Card
      className={`overflow-hidden transition-opacity ${isBusy ? 'opacity-60' : ''}`}
    >
      <div className="relative h-36 bg-gradient-to-br from-brand-azul/20 to-brand-rosa/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imagenUrl}
          alt={banner.titulo}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <ImageIcon className="h-8 w-8 text-white/20" />
        </div>

        <div className="absolute top-2 left-2 flex gap-1">
          {isVigente ? (
            <Badge className="bg-green-500 text-white text-xs">Activo</Badge>
          ) : banner.activo ? (
            <Badge variant="secondary" className="text-xs">
              Programado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-white/80 text-xs">
              Inactivo
            </Badge>
          )}
          {banner.tipoBanner && (
            <Badge variant="outline" className="bg-white/80 text-xs capitalize">
              {banner.tipoBanner.toLowerCase()}
            </Badge>
          )}
        </div>

        <div className="absolute top-2 right-2 flex flex-col gap-0.5">
          <button
            type="button"
            disabled={index === 0 || isBusy}
            onClick={() => onMoveUp(index)}
            className="w-6 h-6 bg-white/80 hover:bg-white rounded flex items-center justify-center shadow disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1 || isBusy}
            onClick={() => onMoveDown(index)}
            className="w-6 h-6 bg-white/80 hover:bg-white rounded flex items-center justify-center shadow disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <p className="font-semibold text-sm text-gray-900 truncate">
          {banner.titulo}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            {banner.fechaInicio}
            {banner.fechaFin ? ` → ${banner.fechaFin}` : ' (sin vencimiento)'}
          </span>
        </div>
        {banner.prioridad > 0 && (
          <p className="text-xs text-muted-foreground">
            Prioridad: {banner.prioridad}
          </p>
        )}

        <div className="flex items-center gap-1 pt-1 border-t">
          <Button
            size="sm"
            variant="ghost"
            className="flex-1 h-7 text-xs gap-1"
            onClick={() => onEdit(banner)}
            disabled={isBusy}
          >
            <Pencil className="h-3 w-3" /> Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`flex-1 h-7 text-xs gap-1 ${banner.activo ? 'text-amber-600' : 'text-green-600'}`}
            onClick={() => onToggle(banner)}
            disabled={isBusy}
          >
            {banner.activo ? (
              <>
                <ToggleRight className="h-3 w-3" /> Desactivar
              </>
            ) : (
              <>
                <ToggleLeft className="h-3 w-3" /> Activar
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-brand-azul"
            onClick={() => onDuplicate(banner.id)}
            disabled={isBusy}
            title="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(banner.id)}
            disabled={isBusy}
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function BannersPage() {
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Banner | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useBanners()
  const banners: Banner[] = data?.content ?? []

  const crear = useCrearBanner()
  const actualizar = useActualizarBanner()
  const toggle = useToggleBanner()
  const duplicar = useDuplicarBanner()
  const eliminar = useEliminarBanner()
  const reordenar = useReordenarBanners()

  function handleMoveUp(index: number) {
    if (index === 0) return
    const newOrder = [...banners]
    ;[newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ]
    reordenar.mutate(newOrder.map((b) => b.id))
  }

  function handleMoveDown(index: number) {
    if (index >= banners.length - 1) return
    const newOrder = [...banners]
    ;[newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ]
    reordenar.mutate(newOrder.map((b) => b.id))
  }

  function handleSubmit(payload: CrearBannerPayload | ActualizarBannerPayload) {
    if (editTarget) {
      actualizar.mutate(
        { id: editTarget.id, payload },
        { onSuccess: () => setFormOpen(false) }
      )
    } else {
      crear.mutate(payload as CrearBannerPayload, {
        onSuccess: () => setFormOpen(false),
      })
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Banners' }]}
      />

      <PageHeader
        title="Banners"
        description="Gestiona los banners del sitio web público"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Nuevo banner
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? '…'
            : `${banners.length} banner${banners.length !== 1 ? 's' : ''} en total`}
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && banners.length === 0 && (
        <EmptyState
          title="Sin banners"
          description="Crea el primer banner para mostrarlo en la página principal."
          icon={<ImageIcon className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nuevo banner
            </Button>
          }
        />
      )}

      {!isLoading && banners.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b, i) => (
            <BannerCard
              key={b.id}
              banner={b}
              index={i}
              total={banners.length}
              loadingId={loadingId}
              onEdit={(banner) => {
                setEditTarget(banner)
                setFormOpen(true)
              }}
              onToggle={(banner) => {
                setLoadingId(banner.id)
                toggle.mutate(
                  { id: banner.id, activo: banner.activo },
                  { onSettled: () => setLoadingId(null) }
                )
              }}
              onDuplicate={(id) => {
                setLoadingId(id)
                duplicar.mutate(id, { onSettled: () => setLoadingId(null) })
              }}
              onDelete={(id) => setDeleteId(id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      <BannerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        banner={editTarget}
        onSubmit={handleSubmit}
        isLoading={crear.isPending || actualizar.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar banner?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null) {
            setLoadingId(deleteId)
            eliminar.mutate(deleteId, {
              onSettled: () => {
                setLoadingId(null)
                setDeleteId(null)
              },
            })
          }
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
