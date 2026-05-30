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
import { MediaUploaderMulti } from '@/components/common/MediaUploaderMulti'
import { ZonaPreview } from '@/components/admin/comercial/zonas/ZonaPreview'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { useZonasAdmin, useZonaMutations } from '@/hooks/useComercial'
import { ZonaJuego } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValues } from '@/lib/media'

const VIDEO_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|tiktok\.com\/).+$/

const schema = z.object({
  nombre:      z.string()
    .min(1, 'El nombre es obligatorio')
    .max(25, 'Máximo 25 caracteres'),
  descripcion: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(100, 'Máximo 100 caracteres'),
  edadMinima:  z.coerce.number({ invalid_type_error: 'Ingresa un número' })
    .min(0, 'Mínimo 0 años').optional().nullable(),
  edadMaxima:  z.coerce.number({ invalid_type_error: 'Ingresa un número' })
    .max(17, 'Máximo 17 años').optional().nullable(),
  activa:      z.boolean().default(true),
  destacada:   z.boolean().default(false),
  orden:       z.coerce.number({ invalid_type_error: 'Ingresa un número' }).default(0),
})
type FormValues = z.infer<typeof schema>

function ZonaFormDialog({
  open, onOpenChange, zona,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  zona: ZonaJuego | null
}) {
  const { crear, actualizar } = useZonaMutations()
  const isEditing = !!zona
  const [imagenesMedia, setImagenesMedia] = useState<MediaValue[]>([])
  const [videos, setVideos]               = useState<string[]>([])
  const [videoInput, setVideoInput]       = useState('')
  const [uploading, setUploading]         = useState(false)
  const [mobileTab, setMobileTab]         = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', descripcion: '', edadMinima: null, edadMaxima: null, activa: true, destacada: false, orden: 0 },
  })

  useEffect(() => {
    if (open) {
      if (zona) {
        reset({
          nombre: zona.nombre, descripcion: zona.descripcion,
          edadMinima: zona.edadMinima ?? null, edadMaxima: zona.edadMaxima ?? null,
          activa: zona.activa, destacada: zona.destacada, orden: zona.orden,
        })
        setImagenesMedia((zona.imagenes ?? []).map((url) => ({ url: fixMediaUrl(url), esLocal: false })))
        setVideos(zona.videos ?? [])
      } else {
        reset({ nombre: '', descripcion: '', edadMinima: null, edadMaxima: null, activa: true, destacada: false, orden: 0 })
        setImagenesMedia([])
        setVideos([])
      }
      setMobileTab('form')
    }
  }, [open, zona, reset])

  const nombre      = watch('nombre')
  const descripcion = watch('descripcion')
  const edadMinima  = watch('edadMinima')
  const edadMaxima  = watch('edadMaxima')

  function agregarVideo() {
    if (!VIDEO_REGEX.test(videoInput)) { toast.error('URL de video no válida. Debe ser de YouTube o TikTok'); return }
    if (videos.length >= 3) { toast.error('Máximo 3 videos permitidos'); return }
    setVideos((prev) => [...prev, videoInput])
    setVideoInput('')
  }

  async function onSubmit(data: FormValues) {
    setUploading(true)
    try {
      const imagenesUrls = await resolverMediaValues(imagenesMedia, 'zonas')
      const payload = {
        nombre: data.nombre, descripcion: data.descripcion,
        edadMinima: data.edadMinima || undefined, edadMaxima: data.edadMaxima || undefined,
        imagenes: imagenesUrls, videos,
      }
      if (isEditing && zona) {
        await actualizar.mutateAsync({
          id: zona.id,
          payload: { ...payload, activa: data.activa, destacada: data.destacada, orden: data.orden },
        })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar la zona')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenesMedia([]) } onOpenChange(v) }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar zona' : 'Nueva zona'}</DialogTitle>
        </DialogHeader>

        <div className="flex lg:hidden gap-1 rounded-lg bg-muted p-1 mb-2">
          {(['form', 'preview'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setMobileTab(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${mobileTab === t ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}>
              {t === 'form' ? 'Formulario' : 'Vista previa'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-6">
            <div className={mobileTab === 'preview' ? 'hidden lg:block' : undefined}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Nombre *</Label>
                  <Input {...register('nombre')} placeholder="Aventura" />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Descripción *</Label>
                  <Input {...register('descripcion')} placeholder="Zona de..." />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Edad mínima</Label>
                    <Input type="number" {...register('edadMinima')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Edad máxima</Label>
                    <Input type="number" {...register('edadMaxima')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Orden</Label>
                    <Input type="number" {...register('orden')} />
                  </div>
                </div>

                <MediaUploaderMulti
                  values={imagenesMedia}
                  onChange={setImagenesMedia}
                  carpeta="zonas"
                  maxImagenes={8}
                />

                <div className="space-y-2">
                  <Label>Videos ({videos.length}/3)</Label>
                  {videos.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs truncate flex-1 text-muted-foreground">{url}</span>
                      <button type="button" onClick={() => setVideos((prev) => prev.filter((_, j) => j !== i))}>
                        <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  {videos.length < 3 && (
                    <div className="flex gap-2">
                      <Input value={videoInput} onChange={(e) => setVideoInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..." className="text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={agregarVideo}>Agregar</Button>
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
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenesMedia([]); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear zona'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <ZonaPreview
                  nombre={nombre}
                  descripcion={descripcion}
                  edadMin={edadMinima}
                  edadMax={edadMaxima}
                  imagenes={imagenesMedia.map((m) => m.url)}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function ZonasPage() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<ZonaJuego | null>(null)
  const [deleteId, setDeleteId]     = useState<number | null>(null)

  const { data: zonas = [], isLoading, isError, refetch } = useZonasAdmin()
  const { eliminar, toggleActivo } = useZonaMutations()

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comercial', href: '/admin/comercial' }, { label: 'Zonas' }]} />

      <PageHeader
        title="Zonas de juego"
        description="Administra las zonas del local"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nueva zona
          </Button>
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      )}

      {!isLoading && zonas.length === 0 && (
        <EmptyState title="Sin zonas" description="Crea la primera zona de juego."
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
                <th className="px-4 py-3 text-center hidden md:table-cell">Imágenes</th>
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
                    {z.edadMinima != null && z.edadMaxima != null ? `${z.edadMinima}–${z.edadMaxima} años` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{z.imagenes.length}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{z.videos.length}</td>
                  <td className="px-4 py-3">
                    <QuickToggle
                      activo={z.activa}
                      onToggle={() => toggleActivo.mutate(z)}
                      isPending={toggleActivo.isPending && (toggleActivo.variables as ZonaJuego)?.id === z.id}
                    />
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
        description="La zona y todos sus medios serán eliminados permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
