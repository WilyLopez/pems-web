'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Video, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
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
import { useZonaMutations } from '../hooks/useZonas'
import { ZonaJuego } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValues } from '@/lib/media'

const VIDEO_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|tiktok\.com\/).+$/

export const zonasSchema = z.object({
  nombre:      z.string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  descripcion: z.string()
    .min(1, 'La descripción es obligatoria')
    .max(130, 'Máximo 130 caracteres'),
  edadMinima:  z.coerce.number('Ingresa un número')
    .min(0, 'Mínimo 0 años').optional().nullable(),
  edadMaxima:  z.coerce.number('Ingresa un número')
    .max(10, 'Máximo 10 años').optional().nullable(),
  activa:      z.boolean().default(true),
  destacada:   z.boolean().default(false),
  orden:       z.coerce.number('Ingresa un número').default(0),
})
export type ZonaFormValues = z.infer<typeof zonasSchema>

interface ZonaFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  zona: ZonaJuego | null
}

export function ZonaFormDialog({
  open,
  onOpenChange,
  zona,
}: ZonaFormDialogProps) {
  const { crear, actualizar } = useZonaMutations()
  const isEditing = !!zona
  const [imagenesMedia, setImagenesMedia] = useState<MediaValue[]>([])
  const [videos, setVideos]               = useState<string[]>([])
  const [videoInput, setVideoInput]       = useState('')
  const [uploading, setUploading]         = useState(false)
  const [mobileTab, setMobileTab]         = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ZonaFormValues>({
    resolver: zodResolver(zonasSchema),
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

  async function onSubmit(data: ZonaFormValues) {
    setUploading(true)
    try {
      const imagenesUrls = await resolverMediaValues(imagenesMedia, 'zonas')
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        edadMinima: data.edadMinima || undefined,
        edadMaxima: data.edadMaxima || undefined,
        imagenes: imagenesUrls,
        videos,
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
                        placeholder="https://www.youtube.com/watch?v=..." className="text-sm font-normal" />
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
