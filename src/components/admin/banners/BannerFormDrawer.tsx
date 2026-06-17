'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { MediaUploader } from '@/components/common/MediaUploader'
import { useCrearBanner, useActualizarBanner } from '@/hooks/useBanners'
import { Banner, TipoBanner, CrearBannerPayload } from '@/types/banner.types'
import { BannerTipoSelector } from './BannerTipoSelector'
import { BannerPreview } from './BannerPreview'

const schema = z.object({
  tipoBanner:     z.string().optional(),
  titulo:         z.string().min(1, 'Requerido').max(60, 'Maximo 60 caracteres'),
  descripcion:    z.string().max(150).optional(),
  imagenUrl:      z.string().min(1, 'La imagen principal es requerida'),
  imagenMovilUrl: z.string().optional(),
  colorOverlay:   z.string().optional(),
  overlayOpacity: z.number().min(0).max(80).default(0),
  enlaceDestino:  z.string().optional(),
  textoBoton:     z.string().max(30).optional(),
  soloMovil:      z.boolean().default(false),
  soloDesktop:    z.boolean().default(false),
  prioridad:      z.number().min(0).max(100).default(0),
  fechaInicio:    z.string().min(1, 'Requerido'),
  fechaFin:       z.string().optional(),
  orden:          z.number().default(0),
})

type FormValues = z.infer<typeof schema>

interface BannerFormDrawerProps {
  open:    boolean
  onClose: () => void
  banner?: Banner | null
}

export function BannerFormDrawer({ open, onClose, banner }: BannerFormDrawerProps) {
  const [imagenMovilDistinta, setImagenMovilDistinta] = useState(false)

  const crear      = useCrearBanner()
  const actualizar = useActualizarBanner()
  const isPending  = crear.isPending || actualizar.isPending

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoBanner:     undefined,
      titulo:         '',
      descripcion:    '',
      imagenUrl:      '',
      imagenMovilUrl: undefined,
      colorOverlay:   '#000000',
      overlayOpacity: 0,
      enlaceDestino:  '',
      textoBoton:     '',
      soloMovil:      false,
      soloDesktop:    false,
      prioridad:      0,
      fechaInicio:    new Date().toISOString().split('T')[0],
      fechaFin:       '',
      orden:          0,
    },
  })

  useEffect(() => {
    if (banner && open) {
      reset({ ...banner, overlayOpacity: 0 })
      setImagenMovilDistinta(!!banner.imagenMovilUrl)
    } else if (!open) {
      reset()
      setImagenMovilDistinta(false)
    }
  }, [banner, open])

  function onSubmit(values: FormValues) {
    const { overlayOpacity, ...rest } = values
    const payload: CrearBannerPayload = {
      ...rest,
      tipoBanner:     values.tipoBanner as TipoBanner | undefined,
      colorOverlay:   overlayOpacity > 0 ? values.colorOverlay : undefined,
      imagenMovilUrl: imagenMovilDistinta ? values.imagenMovilUrl : undefined,
    }
    if (banner) {
      actualizar.mutate({ id: banner.id, payload }, { onSuccess: onClose })
    } else {
      crear.mutate(payload, { onSuccess: onClose })
    }
  }

  const titulo         = watch('titulo')
  const descripcion    = watch('descripcion')
  const imagenUrl      = watch('imagenUrl')
  const imagenMovilUrl = watch('imagenMovilUrl')
  const colorOverlay   = watch('colorOverlay')
  const overlayOpacity = watch('overlayOpacity') ?? 0
  const textoBoton     = watch('textoBoton')
  const tipoBanner     = watch('tipoBanner')
  const soloMovil      = watch('soloMovil')
  const soloDesktop    = watch('soloDesktop')

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-[960px] p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 pr-12 border-b shrink-0">
          <DialogTitle>{banner ? 'Editar banner' : 'Nuevo banner'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid lg:grid-cols-[480px_1fr]">
          <div className="overflow-y-auto border-r">
            <form id="banner-form" onSubmit={handleSubmit(onSubmit)}>
              <Accordion
                type="multiple"
                defaultValue={['clasificacion', 'contenido', 'imagen', 'publicacion']}
                className="px-6"
              >
                <AccordionItem value="clasificacion">
                  <AccordionTrigger>Clasificacion</AccordionTrigger>
                  <AccordionContent>
                    <Controller
                      name="tipoBanner"
                      control={control}
                      render={({ field }) => (
                        <BannerTipoSelector
                          value={field.value}
                          onChange={(tipo) => field.onChange(tipo)}
                        />
                      )}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="contenido">
                  <AccordionTrigger>Contenido</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="titulo">Titulo</Label>
                        <span className="text-xs text-gray-400">{titulo?.length ?? 0}/60</span>
                      </div>
                      <Input
                        id="titulo"
                        placeholder="Ej: Nuevo show de verano"
                        {...register('titulo')}
                      />
                      {errors.titulo && (
                        <p className="text-xs text-destructive">{errors.titulo.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="descripcion">Descripcion</Label>
                        <span className="text-xs text-gray-400">{descripcion?.length ?? 0}/150</span>
                      </div>
                      <Textarea
                        id="descripcion"
                        placeholder="Descripcion opcional del banner..."
                        rows={3}
                        {...register('descripcion')}
                        className="resize-none"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="imagen">
                  <AccordionTrigger>Imagen</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      <Label>Imagen principal (desktop)</Label>
                      <Controller
                        name="imagenUrl"
                        control={control}
                        render={({ field }) => (
                          <MediaUploader
                            carpeta="banners"
                            aspectRatio="16:9"
                            placeholder="Imagen principal del banner"
                            value={field.value ? { url: field.value, esLocal: false } : null}
                            onChange={(mv) => field.onChange(mv?.url ?? '')}
                          />
                        )}
                      />
                      {errors.imagenUrl && (
                        <p className="text-xs text-destructive">{errors.imagenUrl.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        id="movil-distinta"
                        checked={imagenMovilDistinta}
                        onCheckedChange={setImagenMovilDistinta}
                      />
                      <Label htmlFor="movil-distinta" className="cursor-pointer font-normal">
                        Configurar imagen diferente para movil
                      </Label>
                    </div>

                    {imagenMovilDistinta && (
                      <div className="space-y-1">
                        <Label>Imagen para movil</Label>
                        <Controller
                          name="imagenMovilUrl"
                          control={control}
                          render={({ field }) => (
                            <MediaUploader
                              carpeta="banners"
                              aspectRatio="libre"
                              placeholder="Imagen para movil (vertical recomendado)"
                              value={field.value ? { url: field.value, esLocal: false } : null}
                              onChange={(mv) => field.onChange(mv?.url)}
                            />
                          )}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Controller
                        name="colorOverlay"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="color"
                            value={field.value ?? '#000000'}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                          />
                        )}
                      />
                      <div className="flex-1 space-y-1">
                        <Label>Opacidad del overlay</Label>
                        <Controller
                          name="overlayOpacity"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="range"
                              min={0}
                              max={80}
                              value={field.value}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="w-full"
                            />
                          )}
                        />
                        <p className="text-[11px] text-gray-400">{overlayOpacity}% de opacidad</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cta">
                  <AccordionTrigger>Accion CTA</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1">
                      <Label htmlFor="enlaceDestino">Enlace de destino</Label>
                      <Input
                        id="enlaceDestino"
                        placeholder="/promociones o https://..."
                        {...register('enlaceDestino')}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="textoBoton">Texto del boton</Label>
                      <Input
                        id="textoBoton"
                        placeholder="Ver mas, Reservar, ..."
                        maxLength={30}
                        {...register('textoBoton')}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="visibilidad">
                  <AccordionTrigger>Visibilidad</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Solo movil</Label>
                        <Controller
                          name="soloMovil"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) setValue('soloDesktop', false)
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Solo desktop</Label>
                        <Controller
                          name="soloDesktop"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) setValue('soloMovil', false)
                              }}
                            />
                          )}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="prioridad">Prioridad (0-100)</Label>
                        <Input
                          id="prioridad"
                          type="number"
                          min={0}
                          max={100}
                          {...register('prioridad', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="publicacion">
                  <AccordionTrigger>Publicacion</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="fechaInicio">Fecha de inicio *</Label>
                        <Input
                          id="fechaInicio"
                          type="date"
                          {...register('fechaInicio')}
                        />
                        {errors.fechaInicio && (
                          <p className="text-xs text-destructive">{errors.fechaInicio.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="fechaFin">Fecha de fin</Label>
                        <Input
                          id="fechaFin"
                          type="date"
                          {...register('fechaFin')}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 w-1/2">
                      <Label htmlFor="orden">Orden de visualizacion</Label>
                      <Input
                        id="orden"
                        type="number"
                        min={0}
                        {...register('orden', { valueAsNumber: true })}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </div>

          <div className="hidden lg:block overflow-y-auto bg-gray-50">
            <div className="sticky top-0 p-6 space-y-4">
              <BannerPreview
                imagenUrl={imagenUrl ?? ''}
                imagenMovilUrl={imagenMovilUrl}
                titulo={titulo ?? ''}
                descripcion={descripcion}
                textoBoton={textoBoton}
                colorOverlay={overlayOpacity > 0 ? colorOverlay : undefined}
                overlayOpacity={overlayOpacity}
                tipoBanner={tipoBanner}
                soloMovil={soloMovil}
                soloDesktop={soloDesktop}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-white shrink-0">
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="banner-form"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {banner ? 'Guardar cambios' : 'Crear banner'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
