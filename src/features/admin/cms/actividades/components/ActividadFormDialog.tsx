'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
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
import { MediaUploader } from '@/components/common/MediaUploader'
import { ActividadPreview } from '@/components/admin/comercial/actividades/ActividadPreview'
import { useActividadMutations } from '../hooks/useActividades'
import { useZonasPublico } from '@/features/admin/cms/zonas/hooks/useZonas'
import { ActividadLocal } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

export const actividadesSchema = z.object({
  nombre:      z.string().min(1, 'El nombre es requerido').max(40, 'Máximo 40 caracteres'),
  descripcion: z.string().min(1, 'La descripción es requerida').max(100, 'Máximo 100 caracteres'),
  idZona:      z.coerce.number().optional().nullable(),
  esEspecial:  z.boolean().default(false),
  fechaInicio: z.string().optional(),
  fechaFin:    z.string().optional(),
  activa:      z.boolean().default(true),
  destacada:   z.boolean().default(false),
  orden:       z.coerce.number().default(0),
})
export type ActividadFormValues = z.infer<typeof actividadesSchema>

interface ActividadFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  actividad: ActividadLocal | null
}

export function ActividadFormDialog({
  open,
  onOpenChange,
  actividad,
}: ActividadFormDialogProps) {
  const { crear, actualizar } = useActividadMutations()
  const { data: zonas = [] }  = useZonasPublico()
  const isEditing = !!actividad
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ActividadFormValues>({
    resolver: zodResolver(actividadesSchema),
    defaultValues: {
      nombre: '', descripcion: '', idZona: null,
      esEspecial: false, fechaInicio: '', fechaFin: '',
      activa: true, destacada: false, orden: 0,
    },
  })

  useEffect(() => {
    if (open) {
      if (actividad) {
        reset({
          nombre: actividad.nombre, descripcion: actividad.descripcion,
          idZona: actividad.idZona ?? null, esEspecial: actividad.esEspecial,
          fechaInicio: actividad.fechaInicio ?? '', fechaFin: actividad.fechaFin ?? '',
          activa: actividad.activa, destacada: actividad.destacada, orden: actividad.orden,
        })
        setImagenMedia(actividad.imagenUrl
          ? { url: fixMediaUrl(actividad.imagenUrl), esLocal: false }
          : null)
      } else {
        reset({
          nombre: '', descripcion: '', idZona: null,
          esEspecial: false, fechaInicio: '', fechaFin: '',
          activa: true, destacada: false, orden: 0,
        })
        setImagenMedia(null)
      }
      setMobileTab('form')
    }
  }, [open, actividad, reset])

  const nombre      = watch('nombre')
  const descripcion = watch('descripcion')
  const esEspecial  = watch('esEspecial')
  const idZona      = watch('idZona')
  const nombreZona  = zonas.find((z) => z.id === Number(idZona))?.nombre

  async function onSubmit(data: ActividadFormValues) {
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'actividades')
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        imagenUrl: imagenUrl ?? undefined,
        idZona: data.idZona || undefined,
        esEspecial: data.esEspecial,
        fechaInicio: data.fechaInicio || undefined,
        fechaFin: data.fechaFin || undefined,
      }
      if (isEditing && actividad) {
        await actualizar.mutateAsync({
          id: actividad.id,
          payload: { ...payload, activa: data.activa, destacada: data.destacada, orden: data.orden },
        })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar la actividad')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar actividad' : 'Nueva actividad'}</DialogTitle>
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
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-6">
            <div className={mobileTab === 'preview' ? 'hidden lg:block' : undefined}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Nombre *</Label>
                  <Input {...register('nombre')} placeholder="Escalada" />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Descripción *</Label>
                  <Input {...register('descripcion')} placeholder="Actividad de..." />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Imagen</Label>
                  <MediaUploader value={imagenMedia} onChange={setImagenMedia} carpeta="actividades" aspectRatio="4:3" uploading={uploading} />
                </div>

                <div className="space-y-1">
                  <Label>Zona asociada (opcional)</Label>
                  <select {...register('idZona', { valueAsNumber: true })}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal">
                    <option value="">Sin zona</option>
                    {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" {...register('esEspecial')} className="w-4 h-4 rounded" />
                  <span className="text-sm font-normal">Es actividad especial (temporal)</span>
                </label>

                {esEspecial && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Fecha inicio</Label>
                      <Input type="date" {...register('fechaInicio')} />
                    </div>
                    <div className="space-y-1">
                      <Label>Fecha fin</Label>
                      <Input type="date" {...register('fechaFin')} />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                      <span className="text-sm font-normal">Activa</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                      <span className="text-sm font-normal">Destacada</span>
                    </label>
                    <div className="flex items-center gap-2 ml-auto">
                      <Label className="text-sm">Orden</Label>
                      <Input type="number" {...register('orden')} className="w-20 h-8" />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenMedia(null); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear actividad'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <ActividadPreview
                  nombre={nombre}
                  descripcion={descripcion}
                  imagenUrl={imagenMedia?.url ?? null}
                  esEspecial={esEspecial}
                  nombreZona={nombreZona}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
