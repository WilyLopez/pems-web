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
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { MediaUploader } from '@/components/common/MediaUploader'
import { NovedadPreview } from '@/components/admin/comercial/novedades/NovedadPreview'
import { useNovedadMutations } from '../hooks/useNovedades'
import { NovedadLocal } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

export const novedadesSchema = z
  .object({
    titulo:      z.string().min(1, 'El título es requerido').max(50, 'Máximo 50 caracteres'),
    descripcion: z.string().min(1, 'La descripción es requerida').max(120, 'Máximo 120 caracteres'),
    hasCta:      z.boolean().default(false),
    textoCta:    z.string().max(25, 'Máximo 25 caracteres').optional(),
    urlCta:      z.string().optional(),
    prioridad:   z.coerce.number().min(0, 'Prioridad mínima 0').max(100, 'Prioridad máxima 100').default(0),
    fechaInicio: z.string().optional(),
    fechaFin:    z.string().optional(),
    visibleHome: z.boolean().default(false),
    destacada:   z.boolean().default(false),
    activa:      z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.hasCta) {
        return !!data.textoCta?.trim() && !!data.urlCta?.trim()
      }
      return true
    },
    {
      message: 'Si habilitas la acción CTA, debes ingresar tanto el texto como el enlace de destino.',
      path: ['urlCta'],
    }
  )
  .refine(
    (data) => {
      if (data.fechaFin && data.fechaInicio) {
        return new Date(data.fechaFin) >= new Date(data.fechaInicio)
      }
      return true
    },
    {
      message: 'La fecha de fin debe ser posterior o igual a la de inicio.',
      path: ['fechaFin'],
    }
  )
  .refine(
    (data) => {
      if (data.hasCta && data.urlCta && data.urlCta.trim()) {
        const val = data.urlCta.trim()
        return val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://')
      }
      return true
    },
    {
      message: 'Debe ser una ruta interna (empieza con /) o enlace externo válido (http/https).',
      path: ['urlCta'],
    }
  )

export type NovedadFormValues = z.infer<typeof novedadesSchema>

interface NovedadFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  novedad: NovedadLocal | null
  novedadesHome: number
}

const RUTAS_COMUNES = [
  { value: '/', label: 'Inicio (Página Principal)' },
  { value: '/promociones', label: 'Promociones y Ofertas' },
  { value: '/reservas', label: 'Reservas de Eventos y Shows' },
  { value: '/faqs', label: 'Preguntas Frecuentes (FAQs)' },
  { value: '/sedes', label: 'Ubicaciones / Sedes' },
  { value: '/contacto', label: 'Contacto y Soporte' },
  { value: 'custom', label: 'Enlace personalizado o externo 🔗' },
]

export function NovedadFormDialog({
  open,
  onOpenChange,
  novedad,
  novedadesHome,
}: NovedadFormDialogProps) {
  const { crear, actualizar } = useNovedadMutations()
  const isEditing = !!novedad
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')
  const [selectedRouteType, setSelectedRouteType] = useState<string>('none')

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<NovedadFormValues>({
    resolver: zodResolver(novedadesSchema),
    defaultValues: {
      titulo: '', descripcion: '', hasCta: false, textoCta: '', urlCta: '',
      prioridad: 0, fechaInicio: '', fechaFin: '',
      visibleHome: false, destacada: false, activa: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (novedad) {
        const hasCta = !!novedad.textoCta || !!novedad.urlCta
        reset({
          titulo: novedad.titulo, descripcion: novedad.descripcion,
          hasCta: hasCta,
          textoCta: novedad.textoCta ?? '', urlCta: novedad.urlCta ?? '',
          prioridad: novedad.prioridad,
          fechaInicio: novedad.fechaInicio ?? '', fechaFin: novedad.fechaFin ?? '',
          visibleHome: novedad.visibleHome, destacada: novedad.destacada, activa: novedad.activa,
        })
        setImagenMedia(novedad.imagenUrl
          ? { url: fixMediaUrl(novedad.imagenUrl), esLocal: false }
          : null)

        if (novedad.urlCta) {
          const match = RUTAS_COMUNES.find((r) => r.value === novedad.urlCta)
          if (match && match.value !== 'custom') {
            setSelectedRouteType(match.value)
          } else {
            setSelectedRouteType('custom')
          }
        } else {
          setSelectedRouteType('none')
        }
      } else {
        reset({
          titulo: '', descripcion: '', hasCta: false, textoCta: '', urlCta: '',
          prioridad: 0, fechaInicio: '', fechaFin: '',
          visibleHome: false, destacada: false, activa: true,
        })
        setImagenMedia(null)
        setSelectedRouteType('none')
      }
      setMobileTab('form')
    }
  }, [open, novedad, reset])

  const titulo      = watch('titulo')
  const descripcion = watch('descripcion')
  const hasCta      = watch('hasCta')
  const textoCta    = watch('textoCta')
  const urlCta      = watch('urlCta')
  const visibleHome = watch('visibleHome')
  const fechaInicio = watch('fechaInicio')

  const mostrarAlertaHome = visibleHome && novedadesHome >= 3 && !novedad?.visibleHome

  async function onSubmit(data: NovedadFormValues) {
    if (data.visibleHome && novedadesHome >= 3 && !isEditing) {
      toast.error('Ya hay 3 novedades en el inicio. Desactiva una antes de agregar otra.')
      return
    }
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'novedades')
      const payload = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        imagenUrl: imagenUrl ?? undefined,
        textoCta: data.hasCta ? (data.textoCta || undefined) : undefined,
        urlCta: data.hasCta ? (data.urlCta || undefined) : undefined,
        prioridad: data.prioridad,
        fechaInicio: data.fechaInicio || undefined,
        fechaFin: data.fechaFin || undefined,
        visibleHome: data.visibleHome,
        destacada: data.destacada,
      }
      if (isEditing && novedad) {
        await actualizar.mutateAsync({ id: novedad.id, payload: { ...payload, activa: data.activa } })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar la novedad')
    } finally {
      setUploading(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar novedad' : 'Nueva novedad'}</DialogTitle>
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
                  <div className="flex justify-between">
                    <Label>Título *</Label>
                    <span className="text-xs text-muted-foreground">{titulo?.length ?? 0}/50</span>
                  </div>
                  <Input {...register('titulo')} placeholder="Novedades de mayo" />
                  {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Descripción *</Label>
                    <span className="text-xs text-muted-foreground">{descripcion?.length ?? 0}/120</span>
                  </div>
                  <Textarea rows={2} {...register('descripcion')} className="resize-none font-sans" />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Imagen</Label>
                  <MediaUploader value={imagenMedia} onChange={setImagenMedia} carpeta="novedades" aspectRatio="16:9" uploading={uploading} />
                </div>

                <div className="flex flex-col gap-3 py-2 border-y border-gray-100 my-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" {...register('hasCta')} className="w-4 h-4 rounded text-brand-azul" />
                    <span className="text-sm font-semibold text-gray-700">Habilitar botón / acción de llamada a la acción (CTA)</span>
                  </label>
                </div>

                {hasCta && (
                  <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Destino de la acción</Label>
                      <Select
                        value={selectedRouteType}
                        onValueChange={(val) => {
                          if (val === 'none') {
                            setSelectedRouteType('none')
                            setValue('urlCta', '')
                          } else {
                            setSelectedRouteType(val)
                            if (val === 'custom') {
                              setValue('urlCta', '')
                            } else {
                              setValue('urlCta', val, { shouldValidate: true })
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-full rounded-xl bg-white border border-gray-200">
                          <SelectValue placeholder="Selecciona una página destino..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Seleccionar destino...</SelectItem>
                          {RUTAS_COMUNES.map((ruta) => (
                            <SelectItem key={ruta.value} value={ruta.value}>
                              {ruta.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRouteType === 'custom' && (
                      <div className="space-y-1">
                        <Label htmlFor="urlCta">Ruta personalizada o URL externa</Label>
                        <Input
                          id="urlCta"
                          placeholder="Ej: /promociones/descuento o https://..."
                          {...register('urlCta')}
                          className="rounded-xl"
                        />
                      </div>
                    )}
                    {errors.urlCta && <p className="text-xs text-destructive">{errors.urlCta.message}</p>}

                    <div className="space-y-1">
                      <Label htmlFor="textoCta">Texto del botón</Label>
                      <Input
                        id="textoCta"
                        placeholder="Ej: Ver más, Reservar..."
                        {...register('textoCta')}
                        className="rounded-xl"
                      />
                      {errors.textoCta && <p className="text-xs text-destructive">{errors.textoCta.message}</p>}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Prioridad (0-100)</Label>
                    <Input type="number" {...register('prioridad')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Desde</Label>
                    <Input 
                      type="date" 
                      min={novedad?.fechaInicio || todayStr} 
                      {...register('fechaInicio')} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hasta</Label>
                    <Input 
                      type="date" 
                      min={fechaInicio || todayStr} 
                      {...register('fechaFin')} 
                    />
                    {errors.fechaFin && <p className="text-xs text-destructive">{errors.fechaFin.message}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" {...register('visibleHome')} className="w-4 h-4 rounded" />
                    <span className="text-sm font-normal">Visible en inicio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                    <span className="text-sm font-normal">Destacada</span>
                  </label>
                  {isEditing && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                      <span className="text-sm font-normal">Activa</span>
                    </label>
                  )}
                </div>

                {mostrarAlertaHome && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 font-medium">
                    Solo se muestran 3 novedades en el inicio. Esta reemplazará a la de menor prioridad.
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenMedia(null); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear novedad'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <NovedadPreview
                  titulo={titulo}
                  descripcion={descripcion}
                  imagenUrl={imagenMedia?.url ?? null}
                  textoCta={hasCta ? textoCta : undefined}
                  visibleHome={visibleHome}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
