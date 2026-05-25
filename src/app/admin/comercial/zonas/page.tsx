'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, MapPin, X, Image as ImageIcon, Video } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { MediaUploader } from '@/components/common/MediaUploader'
import { useZonasAdmin, useZonaMutations } from '@/hooks/useComercial'
import { ZonaJuego } from '@/types/comercial.types'

const VIDEO_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|tiktok\.com\/).+$/

const schema = z.object({
  nombre: z.string().min(1).max(25),
  descripcion: z.string().min(1).max(100),
  edadMinima: z.number({ coerce: true }).min(0).optional().nullable(),
  edadMaxima: z.number({ coerce: true }).max(17).optional().nullable(),
  activa: z.boolean().default(true),
  destacada: z.boolean().default(false),
  orden: z.number({ coerce: true }).default(0),
})
type FormValues = z.infer<typeof schema>

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function fixMediaUrl(url: string | null | undefined) {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.split('/api/')[0] ?? ''
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function ZonaFormDialog({
  open,
  onOpenChange,
  zona,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  zona: ZonaJuego | null
}) {
  const { crear, actualizar, agregarMedia, eliminarMedia } = useZonaMutations()
  const isEditing = !!zona
  const [imagenes, setImagenes] = useState<string[]>(zona?.imagenes ?? [])
  const [videos, setVideos] = useState<string[]>(zona?.videos ?? [])
  const [videoInput, setVideoInput] = useState('')
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      edadMinima: null,
      edadMaxima: null,
      activa: true,
      destacada: false,
      orden: 0,
    },
  })

  // Sincronizar datos cuando cambia la zona o se abre el modal
  useEffect(() => {
    if (open) {
      if (zona) {
        reset({
          nombre: zona.nombre,
          descripcion: zona.descripcion,
          edadMinima: zona.edadMinima ?? null,
          edadMaxima: zona.edadMaxima ?? null,
          activa: zona.activa,
          destacada: zona.destacada,
          orden: zona.orden,
        })
        setImagenes(zona.imagenes ?? [])
        setVideos(zona.videos ?? [])
      } else {
        reset({
          nombre: '',
          descripcion: '',
          edadMinima: null,
          edadMaxima: null,
          activa: true,
          destacada: false,
          orden: 0,
        })
        setImagenes([])
        setVideos([])
      }
    }
  }, [open, zona, reset])

  function onSubmit(data: FormValues) {
    const payload = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      edadMinima: data.edadMinima || undefined,
      edadMaxima: data.edadMaxima || undefined,
      imagenes,
      videos,
    }
    if (isEditing && zona) {
      actualizar.mutate(
        { id: zona.id, payload: { ...payload, activa: data.activa, destacada: data.destacada, orden: data.orden } },
        { onSuccess: () => { onOpenChange(false); reset() } }
      )
    } else {
      crear.mutate(payload, { onSuccess: () => { onOpenChange(false); reset() } })
    }
  }

  function agregarVideo() {
    if (!VIDEO_REGEX.test(videoInput)) {
      toast.error('URL de video no valida. Debe ser de YouTube o TikTok')
      return
    }
    if (videos.length >= 3) {
      toast.error('Maximo 3 videos permitidos')
      return
    }
    setVideos((prev) => [...prev, videoInput])
    setVideoInput('')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar zona' : 'Nueva zona'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input {...register('nombre')} className="mt-1" placeholder="Aventura" />
            {errors.nombre && <p className="text-xs text-destructive mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <Label>Descripcion *</Label>
            <Input {...register('descripcion')} className="mt-1" placeholder="Zona de..." />
            {errors.descripcion && <p className="text-xs text-destructive mt-1">{errors.descripcion.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Edad minima</Label>
              <Input type="number" {...register('edadMinima')} className="mt-1" />
            </div>
            <div>
              <Label>Edad maxima</Label>
              <Input type="number" {...register('edadMaxima')} className="mt-1" />
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} className="mt-1" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Imagenes ({imagenes.length}/8)</Label>
              {imagenes.length < 8 && !subiendoImagen && (
                <span className="text-xs text-muted-foreground">Subir imagen abajo</span>
              )}
            </div>
            {imagenes.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {imagenes.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                    <img src={fixMediaUrl(url)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagenes((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 hover:bg-destructive flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imagenes.length < 8 && (
              <MediaUploader
                value={null}
                onChange={(url) => {
                  if (url) setImagenes((prev) => [...prev, url])
                }}
                carpeta="zonas"
                aspectRatio="4:3"
                placeholder="Agregar imagen"
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Videos ({videos.length}/3)</Label>
            </div>
            {videos.map((url, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs truncate flex-1 text-muted-foreground">{url}</span>
                <button type="button" onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))}>
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
            {videos.length < 3 && (
              <div className="flex gap-2">
                <Input
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={agregarVideo}>
                  Agregar
                </Button>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                <span className="text-sm">Activa</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                <span className="text-sm">Destacada</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => { reset(); onOpenChange(false) }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={crear.isPending || actualizar.isPending}
              className="bg-brand-azul text-white"
            >
              {crear.isPending || actualizar.isPending ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear zona'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ZonasPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ZonaJuego | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: zonas = [], isLoading, isError, refetch } = useZonasAdmin()
  const { eliminar } = useZonaMutations()

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'Comercial', href: '/admin/comercial/zonas' }, { label: 'Zonas' }]}
      />

      <PageHeader
        title="Zonas de juego"
        description="Administra las zonas del local"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}
          >
            <Plus className="h-4 w-4" />
            Nueva zona
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      )}

      {!isLoading && zonas.length === 0 && (
        <EmptyState
          title="Sin zonas"
          description="Crea la primera zona de juego."
          icon={<MapPin className="h-6 w-6" />}
          action={
            <Button size="sm" className="bg-brand-azul text-white gap-1.5"
              onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" /> Nueva zona
            </Button>
          }
        />
      )}

      {!isLoading && zonas.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Zona</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Rango edad</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Imagenes</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Videos</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.map((z) => (
                <tr key={z.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {z.imagenes.length > 0 ? (
                        <img src={fixMediaUrl(z.imagenes[0])} alt={z.nombre}
                          className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{z.nombre}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{z.descripcion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {z.edadMinima != null && z.edadMaxima != null
                      ? `${z.edadMinima} - ${z.edadMaxima} anos`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{z.imagenes.length}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{z.videos.length}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={z.activa ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}
                    >
                      {z.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => { setEditTarget(z); setFormOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={() => setDeleteId(z.id)}>
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

      <ZonaFormDialog open={formOpen} onOpenChange={setFormOpen} zona={editTarget} />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar zona"
        description="La zona y todos sus medios seran eliminados permanentemente."
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
