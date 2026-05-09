'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  Star,
  Plus,
  ToggleLeft,
  ToggleRight,
  Copy,
  Trash2,
  Pencil,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  CalendarDays,
} from 'lucide-react'
import {
  cmsService,
  Resena,
  Banner,
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/services/cms.service'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { formatDate } from '@/lib/utils'
import { BannerFormDialog } from './BannerFormDialog'

// ── Reseñas ───────────────────────────────────────────────────────────────────

const KEY_RESENAS = 'resenas'
const KEY_BANNERS = 'banners'

function ResenaCard({ resena, onAprobar, onRechazar, loadingId }: {
  resena: Resena
  onAprobar: (id: number) => void
  onRechazar: (id: number) => void
  loadingId: number | null
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{resena.nombreAutor}</p>
            <p className="text-xs text-muted-foreground">{formatDate(resena.fechaCreacion)}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < resena.calificacion ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{resena.contenido}</p>
        {!resena.aprobada && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onAprobar(resena.id)}
              disabled={loadingId === resena.id}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => onRechazar(resena.id)}
              disabled={loadingId === resena.id}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Rechazar
            </Button>
          </div>
        )}
        {resena.aprobada && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            Publicada
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

// ── Banners ───────────────────────────────────────────────────────────────────

function BannerCard({
  banner,
  totalBanners,
  index,
  onEdit,
  onToggle,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  loadingId,
}: {
  banner: Banner
  totalBanners: number
  index: number
  onEdit: (b: Banner) => void
  onToggle: (b: Banner) => void
  onDuplicate: (id: number) => void
  onDelete: (id: number) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  loadingId: number | null
}) {
  const isBusy = loadingId === banner.id
  const today = new Date().toISOString().split('T')[0]
  const isVigente =
    banner.activo &&
    banner.fechaInicio <= today &&
    (!banner.fechaFin || banner.fechaFin >= today)

  return (
    <Card className={`overflow-hidden transition-opacity ${isBusy ? 'opacity-60' : ''}`}>
      {/* Thumbnail */}
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

        {/* Status pill */}
        <div className="absolute top-2 left-2">
          {isVigente ? (
            <Badge className="bg-green-500 text-white text-xs">Activo</Badge>
          ) : banner.activo ? (
            <Badge variant="secondary" className="text-xs">Programado</Badge>
          ) : (
            <Badge variant="outline" className="bg-white/80 text-xs">Inactivo</Badge>
          )}
        </div>

        {/* Reorder buttons */}
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
            disabled={index === totalBanners - 1 || isBusy}
            onClick={() => onMoveDown(index)}
            className="w-6 h-6 bg-white/80 hover:bg-white rounded flex items-center justify-center shadow disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CardContent className="p-3 space-y-2">
        <p className="font-semibold text-sm text-gray-900 truncate">{banner.titulo}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            {banner.fechaInicio}
            {banner.fechaFin ? ` → ${banner.fechaFin}` : ' (sin vencimiento)'}
          </span>
        </div>

        {/* Quick actions */}
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
            className={`flex-1 h-7 text-xs gap-1 ${banner.activo ? 'text-amber-600 hover:text-amber-700' : 'text-green-600 hover:text-green-700'}`}
            onClick={() => onToggle(banner)}
            disabled={isBusy}
          >
            {banner.activo ? (
              <><ToggleRight className="h-3 w-3" /> Desactivar</>
            ) : (
              <><ToggleLeft className="h-3 w-3" /> Activar</>
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

// ── Panel de banners ──────────────────────────────────────────────────────────

function BannersTab() {
  const queryClient = useQueryClient()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Banner | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [KEY_BANNERS],
    queryFn: () => cmsService.listarBanners(),
  })

  const banners: Banner[] = data?.content ?? []

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [KEY_BANNERS] })

  const crear = useMutation({
    mutationFn: (p: CrearBannerPayload) => cmsService.crearBanner(p),
    onSuccess: () => { invalidate(); setFormOpen(false); toast.success('Banner creado.') },
    onError: () => toast.error('No se pudo crear el banner.'),
  })

  const actualizar = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActualizarBannerPayload }) =>
      cmsService.actualizarBanner(id, payload),
    onSuccess: () => { invalidate(); setFormOpen(false); toast.success('Banner actualizado.') },
    onError: () => toast.error('No se pudo actualizar el banner.'),
  })

  const toggleActivo = useMutation({
    mutationFn: (b: Banner) =>
      b.activo ? cmsService.desactivarBanner(b.id) : cmsService.activarBanner(b.id),
    onMutate: (b) => setLoadingId(b.id),
    onSuccess: (_, b) => {
      invalidate()
      toast.success(b.activo ? 'Banner desactivado.' : 'Banner activado.')
    },
    onError: () => toast.error('No se pudo cambiar el estado.'),
    onSettled: () => setLoadingId(null),
  })

  const duplicar = useMutation({
    mutationFn: (id: number) => cmsService.duplicarBanner(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => { invalidate(); toast.success('Banner duplicado como borrador.') },
    onError: () => toast.error('No se pudo duplicar el banner.'),
    onSettled: () => setLoadingId(null),
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => cmsService.eliminarBanner(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => { invalidate(); setDeleteId(null); toast.success('Banner eliminado.') },
    onError: () => toast.error('No se pudo eliminar el banner.'),
    onSettled: () => setLoadingId(null),
  })

  const reordenar = useMutation({
    mutationFn: (ids: number[]) => cmsService.reordenarBanners(ids),
    onSuccess: () => invalidate(),
    onError: () => toast.error('No se pudo reordenar.'),
  })

  function handleMoveUp(index: number) {
    if (index === 0) return
    const newOrder = [...banners]
    ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
    reordenar.mutate(newOrder.map((b) => b.id))
  }

  function handleMoveDown(index: number) {
    if (index === banners.length - 1) return
    const newOrder = [...banners]
    ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
    reordenar.mutate(newOrder.map((b) => b.id))
  }

  function handleFormSubmit(payload: CrearBannerPayload | ActualizarBannerPayload) {
    if (editTarget) {
      actualizar.mutate({ id: editTarget.id, payload })
    } else {
      crear.mutate(payload as CrearBannerPayload)
    }
  }

  function openCreate() {
    setEditTarget(null)
    setFormOpen(true)
  }

  function openEdit(b: Banner) {
    setEditTarget(b)
    setFormOpen(true)
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {banners.length} banner{banners.length !== 1 ? 's' : ''} en total
        </p>
        <Button
          size="sm"
          onClick={openCreate}
          className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Nuevo banner
        </Button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      )}

      {!isLoading && banners.length === 0 && (
        <EmptyState
          title="Sin banners"
          description="Crea el primer banner para mostrarlo en la página principal."
          icon={<ImageIcon className="h-6 w-6" />}
          action={
            <Button size="sm" onClick={openCreate} className="bg-brand-azul text-white gap-1.5">
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
              totalBanners={banners.length}
              loadingId={loadingId}
              onEdit={openEdit}
              onToggle={(banner) => toggleActivo.mutate(banner)}
              onDuplicate={(id) => duplicar.mutate(id)}
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
        onSubmit={handleFormSubmit}
        isLoading={crear.isPending || actualizar.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar banner?"
        description="Esta acción no se puede deshacer. El banner se eliminará permanentemente."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={() => deleteId !== null && eliminar.mutate(deleteId)}
        isLoading={eliminar.isPending}
      />
    </div>
  )
}

// ── Página principal CMS ──────────────────────────────────────────────────────

export default function CmsPage() {
  const queryClient = useQueryClient()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const pendientes = useQuery({
    queryKey: [KEY_RESENAS, 'pendientes'],
    queryFn: () => cmsService.listarResenas(true),
  })

  const aprobadas = useQuery({
    queryKey: [KEY_RESENAS, 'aprobadas'],
    queryFn: () => cmsService.listarResenas(false),
  })

  const aprobar = useMutation({
    mutationFn: (id: number) => cmsService.aprobarResena(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_RESENAS] })
      toast.success('Reseña aprobada y publicada.')
    },
    onError: () => toast.error('No se pudo aprobar la reseña.'),
    onSettled: () => setLoadingId(null),
  })

  const rechazar = useMutation({
    mutationFn: (id: number) => cmsService.rechazarResena(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_RESENAS] })
      toast.success('Reseña eliminada.')
    },
    onError: () => toast.error('No se pudo rechazar la reseña.'),
    onSettled: () => setLoadingId(null),
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="CMS"
        description="Gestión de contenido del sitio web público"
      />

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Reseñas pendientes
            {(pendientes.data?.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {pendientes.data!.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobadas">Reseñas publicadas</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-4">
          {pendientes.isError && <ErrorState onRetry={pendientes.refetch} />}
          {pendientes.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
          )}
          {!pendientes.isLoading && !pendientes.isError && (
            (pendientes.data?.length ?? 0) === 0
              ? <EmptyState title="No hay reseñas pendientes" description="Todas las reseñas han sido moderadas." icon={<CheckCircle className="h-6 w-6" />} />
              : <div className="grid gap-3 sm:grid-cols-2">
                  {pendientes.data?.map((r) => (
                    <ResenaCard
                      key={r.id} resena={r} loadingId={loadingId}
                      onAprobar={(id) => aprobar.mutate(id)}
                      onRechazar={(id) => rechazar.mutate(id)}
                    />
                  ))}
                </div>
          )}
        </TabsContent>

        <TabsContent value="aprobadas" className="mt-4">
          {!aprobadas.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {aprobadas.data?.map((r) => (
                <ResenaCard
                  key={r.id} resena={r} loadingId={loadingId}
                  onAprobar={(id) => aprobar.mutate(id)}
                  onRechazar={(id) => rechazar.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <BannersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
