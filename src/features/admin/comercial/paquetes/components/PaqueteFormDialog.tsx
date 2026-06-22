'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { X, Check } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { MediaUploader } from '@/components/common/MediaUploader'
import { PaquetePreview } from '@/components/admin/comercial/paquetes/PaquetePreview'
import { usePaqueteMutations } from '../hooks/usePaquetes'
import { useTiposEventoPublico } from '@/features/admin/comercial/tipos-evento/hooks/useTiposEvento'
import { PaqueteEvento } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

export const paqueteSchema = z.object({
  nombre:           z.string().min(1, 'El nombre es requerido').max(30, 'Máximo 30 caracteres'),
  descripcionCorta: z.string().min(1, 'La descripción es requerida').max(80, 'Máximo 80 caracteres'),
  descripcionLarga: z.string().max(500).optional(),
  precio:           z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
  badge:            z.string().max(20).optional(),
  color:            z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Formato de color inválido (debe ser #RRGGBB)').optional().or(z.literal('')),
  duracionMinutos:  z.coerce.number().min(1).optional().nullable(),
  limitepersonas:   z.coerce.number().min(1).optional().nullable(),
  activo:           z.boolean().default(true),
  destacado:        z.boolean().default(false),
  orden:            z.coerce.number().default(0),
  tipoEventoCodigo: z.string().min(1, 'Debe seleccionar un tipo de evento'),
  beneficios:       z.array(z.object({ valor: z.string().min(3, 'Mínimo 3 caracteres').max(60, 'Máximo 60 caracteres') })).max(8).default([]),
})
export type PaqueteFormValues = z.infer<typeof paqueteSchema>

interface PaqueteFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  paquete: PaqueteEvento | null
}

export function PaqueteFormDialog({
  open,
  onOpenChange,
  paquete,
}: PaqueteFormDialogProps) {
  const { crear, actualizar } = usePaqueteMutations()
  const { data: tiposEvento = [] } = useTiposEventoPublico()
  const isEditing = !!paquete
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')

  const [hasDraft, setHasDraft]       = useState(false)
  const [draftData, setDraftData]     = useState<any>(null)

  const { register, handleSubmit, reset, watch, control, setValue, formState: { errors } } = useForm<PaqueteFormValues>({
    resolver: zodResolver(paqueteSchema),
    defaultValues: {
      nombre: '', descripcionCorta: '', descripcionLarga: '',
      precio: 0, badge: '', color: '#00AEEF',
      duracionMinutos: null, limitepersonas: null,
      activo: true, destacado: false, orden: 0,
      tipoEventoCodigo: '', beneficios: [],
    },
  })
  const watchColor = watch('color')

  // Detect draft on open
  useEffect(() => {
    if (open) {
      const key = `pems_paquete_borrador_${paquete?.id ?? 'nuevo'}`
      const draft = localStorage.getItem(key)
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setDraftData(parsed)
          setHasDraft(true)
        } catch {
          localStorage.removeItem(key)
        }
      }
    } else {
      setHasDraft(false)
      setDraftData(null)
    }
  }, [open, paquete])

  // Auto-save draft on form changes
  useEffect(() => {
    if (open) {
      const subscription = watch((values) => {
        localStorage.setItem(
          `pems_paquete_borrador_${paquete?.id ?? 'nuevo'}`,
          JSON.stringify({
            ...values,
            imagenMedia,
          })
        )
      })
      return () => subscription.unsubscribe()
    }
  }, [open, watch, paquete, imagenMedia])

  useEffect(() => {
    if (open) {
      if (paquete) {
        reset({
          nombre: paquete.nombre, descripcionCorta: paquete.descripcionCorta,
          descripcionLarga: paquete.descripcionLarga ?? '',
          precio: paquete.precio, badge: paquete.badge ?? '',
          color: paquete.color ?? '#00AEEF',
          duracionMinutos: paquete.duracionMinutos ?? null,
          limitepersonas: paquete.limitepersonas ?? null,
          activo: paquete.activo, destacado: paquete.destacado, orden: paquete.orden,
          tipoEventoCodigo: paquete.tipoEventoCodigo ?? '',
          beneficios: (paquete.beneficios ?? []).map((b) => ({ valor: b })),
        })
        setImagenMedia(paquete.imagenUrl
          ? { url: fixMediaUrl(paquete.imagenUrl), esLocal: false }
          : null)
      } else {
        reset({
          nombre: '', descripcionCorta: '', descripcionLarga: '',
          precio: 0, badge: '', color: '#00AEEF',
          duracionMinutos: null, limitepersonas: null,
          activo: true, destacado: false, orden: 0,
          tipoEventoCodigo: '', beneficios: [],
        })
        setImagenMedia(null)
      }
      setMobileTab('form')
    }
  }, [open, paquete, reset])

  const { fields, append, remove } = useFieldArray({ control, name: 'beneficios' })
  const nombre          = watch('nombre')
  const precio          = watch('precio')
  const descripcionCorta = watch('descripcionCorta')
  const beneficios      = watch('beneficios')?.map((b) => b.valor) ?? []

  async function onSubmit(data: PaqueteFormValues) {
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'paquetes')
      const beneficiosArr = data.beneficios.map((b) => b.valor).filter(Boolean)
      const payload = {
        nombre: data.nombre,
        descripcionCorta: data.descripcionCorta,
        descripcionLarga: data.descripcionLarga || undefined,
        precio: data.precio,
        badge: data.badge || undefined,
        color: data.color || undefined,
        imagenUrl: imagenUrl ?? undefined,
        duracionMinutos: data.duracionMinutos || undefined,
        limitepersonas: data.limitepersonas || undefined,
        tipoEventoCodigo: data.tipoEventoCodigo,
        beneficios: beneficiosArr,
      }
      if (isEditing && paquete) {
        await actualizar.mutateAsync({
          id: paquete.id,
          payload: { ...payload, activo: data.activo, destacado: data.destacado, orden: data.orden },
        })
      } else {
        await crear.mutateAsync(payload)
      }
      localStorage.removeItem(`pems_paquete_borrador_${paquete?.id ?? 'nuevo'}`)
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar el paquete')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-[1000px] p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden sm:rounded-2xl">
        <div className="flex flex-col w-full h-full overflow-hidden">
          <DialogHeader className="px-6 py-4 pr-12 border-b shrink-0">
            <DialogTitle>{isEditing ? 'Editar paquete' : 'Nuevo paquete'}</DialogTitle>
          </DialogHeader>

          {/* Tabs selector for mobile view only */}
          <div className="lg:hidden px-6 pt-4 shrink-0">
            <div className="flex gap-1.5 rounded-xl bg-gray-100 p-1">
              {(['form', 'preview'] as const).map((t) => (
                <button key={t} type="button" onClick={() => setMobileTab(t)}
                  className={cn(
                    "flex-1 rounded-lg py-2 text-xs font-bold transition-all",
                    mobileTab === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-white/40"
                  )}>
                  {t === 'form' ? 'Formulario' : 'Vista previa'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Form column (Left) */}
            <div className={cn(
              "flex-1 overflow-y-auto p-6 border-r",
              mobileTab === 'form' ? "block" : "hidden lg:block"
            )}>
              {hasDraft && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4 text-sm text-blue-800 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Existe un borrador pendiente de este paquete.</p>
                    <p className="text-xs text-blue-600">¿Deseas restaurar la información o empezar de nuevo?</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button type="button" size="sm" variant="outline" className="bg-white"
                      onClick={() => {
                        if (draftData) {
                          reset({
                            nombre: draftData.nombre,
                            descripcionCorta: draftData.descripcionCorta,
                            descripcionLarga: draftData.descripcionLarga,
                            precio: draftData.precio,
                            badge: draftData.badge,
                            color: draftData.color,
                            duracionMinutos: draftData.duracionMinutos,
                            limitepersonas: draftData.limitepersonas,
                            activo: draftData.activo,
                            destacado: draftData.destacado,
                            orden: draftData.orden,
                            tipoEventoCodigo: draftData.tipoEventoCodigo,
                            beneficios: draftData.beneficios,
                          })
                          if (draftData.imagenMedia) {
                            setImagenMedia(draftData.imagenMedia)
                          }
                        }
                        setHasDraft(false)
                      }}>
                      Restaurar
                    </Button>
                    <Button type="button" size="sm" variant="ghost" className="text-blue-800 hover:bg-blue-100"
                      onClick={() => {
                        localStorage.removeItem(`pems_paquete_borrador_${paquete?.id ?? 'nuevo'}`)
                        setHasDraft(false)
                      }}>
                      Descartar
                    </Button>
                  </div>
                </div>
              )}

              {tiposEvento.length === 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800 mb-4">
                  Debe crear al menos un tipo de evento antes de crear paquetes.{' '}
                  <Link href="/admin/comercial/paquetes/tipos-evento" className="font-medium underline">
                    Ir a Tipos de Evento
                  </Link>
                </div>
              )}

              <form id="paquete-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>Tipo de Evento *</Label>
                    <select {...register('tipoEventoCodigo')}
                      disabled={tiposEvento.length === 0}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
                      <option value="">Seleccione un tipo de evento</option>
                      {tiposEvento.map((t) => (
                        <option key={t.codigo} value={t.codigo}>{t.nombre}</option>
                      ))}
                    </select>
                    {errors.tipoEventoCodigo && (
                      <p className="text-xs text-destructive">{errors.tipoEventoCodigo.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Nombre *</Label>
                      <Input {...register('nombre')} placeholder="Pack Básico" />
                      {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Precio (S/) *</Label>
                      <Input type="number" step="0.01" {...register('precio')} />
                      {errors.precio && <p className="text-xs text-destructive">{errors.precio.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <Label>Descripción corta *</Label>
                      <span className="text-xs text-muted-foreground">{descripcionCorta?.length ?? 0}/80</span>
                    </div>
                    <Input {...register('descripcionCorta')} placeholder="Resumen en una línea" />
                    {errors.descripcionCorta && <p className="text-xs text-destructive">{errors.descripcionCorta.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label>Descripción larga</Label>
                    <Textarea rows={3} {...register('descripcionLarga')} className="resize-none" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label>Badge</Label>
                      <Input {...register('badge')} placeholder="Más vendido" />
                    </div>
                    <div className="space-y-1 sm:col-span-1">
                      <Label>Color del paquete</Label>
                      <div className="flex items-center gap-1.5 h-9">
                        {['#00AEEF', '#EC4899', '#F59E0B', '#8B5CF6', '#10B981', '#6B7280'].map((presetColor) => (
                          <button
                            key={presetColor}
                            type="button"
                            onClick={() => setValue('color', presetColor)}
                            className={cn(
                              "w-5 h-5 rounded-full border transition-all cursor-pointer shrink-0",
                              watchColor === presetColor
                                ? "ring-2 ring-brand-azul ring-offset-2 scale-110"
                                : "border-gray-200 hover:scale-105"
                            )}
                            style={{ backgroundColor: presetColor }}
                          />
                        ))}
                        <div className="relative w-6 h-6 rounded-full border border-gray-200 overflow-hidden cursor-pointer hover:scale-105 shrink-0 ml-1">
                          <input
                            type="color"
                            {...register('color')}
                            className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                          />
                        </div>
                      </div>
                      {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Orden</Label>
                      <Input type="number" {...register('orden')} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Duración (min)</Label>
                      <Input type="number" {...register('duracionMinutos')} />
                    </div>
                    <div className="space-y-1">
                      <Label>Límite de personas</Label>
                      <Input type="number" {...register('limitepersonas')} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Imagen del paquete</Label>
                    <MediaUploader
                      value={imagenMedia}
                      onChange={setImagenMedia}
                      carpeta="paquetes"
                      aspectRatio="16:9"
                      uploading={uploading}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Beneficios ({fields.length}/8)</Label>
                      {fields.length < 8 && (
                        <button type="button" onClick={() => append({ valor: '' })}
                          className="text-xs text-brand-azul hover:underline">
                          + Agregar
                        </button>
                      )}
                    </div>
                    {fields.map((field, i) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <div className="flex-1">
                          <Input {...register(`beneficios.${i}.valor`)} placeholder={`Beneficio ${i + 1}`} className="h-8 text-sm font-normal" />
                          {errors.beneficios?.[i]?.valor && (
                            <p className="text-[10px] text-destructive mt-0.5">{errors.beneficios[i].valor.message}</p>
                          )}
                        </div>
                        <button type="button" onClick={() => remove(i)}>
                          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                    {errors.beneficios && !Array.isArray(errors.beneficios) && (
                      <p className="text-xs text-destructive">{(errors.beneficios as any).message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
                        <span className="text-sm font-normal">Activo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" {...register('destacado')} className="w-4 h-4 rounded" />
                        <span className="text-sm font-normal">Destacado</span>
                      </label>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Preview column (Right) */}
            <div className={cn(
              "w-full lg:w-[360px] overflow-y-auto bg-gray-50 p-6 flex items-center justify-center border-l shrink-0",
              mobileTab === 'preview' ? "flex" : "hidden lg:flex"
            )}>
              <PaquetePreview
                nombre={nombre}
                precio={precio ?? 0}
                descripcionCorta={descripcionCorta}
                beneficios={beneficios}
                imagenUrl={imagenMedia?.url ?? null}
                color={watchColor}
              />
            </div>
          </div>

          <div className="border-t px-6 py-4 bg-white shrink-0 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => {
              localStorage.removeItem(`pems_paquete_borrador_${paquete?.id ?? 'nuevo'}`)
              reset()
              setImagenMedia(null)
              onOpenChange(false)
            }}>
              Cancelar
            </Button>
            <Button type="submit" form="paquete-form" disabled={uploading || tiposEvento.length === 0} className="bg-brand-azul text-white">
              {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear paquete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
