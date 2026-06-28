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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { MediaUploader } from '@/components/common/MediaUploader'
import {
  useCrearBanner,
  useActualizarBanner,
} from '@/features/admin/cms/banners/hooks/useBanners'
import { Banner, TipoBanner, CrearBannerPayload } from '@/types/banner.types'
import { BannerTipoSelector } from './BannerTipoSelector'
import { BannerPreview } from './BannerPreview'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'
import { MediaValue } from '@/types/media.types'
import { toast } from 'sonner'

const schema = z
  .object({
    tipoBanner: z.string().nullable().optional(),
    titulo: z.string().min(1, 'Requerido').max(60, 'Máximo 60 caracteres'),
    descripcion: z.string().max(150).nullable().optional(),
    imagenUrl: z.string().min(1, 'La imagen principal es requerida'),
    imagenMovilUrl: z.string().nullable().optional(),
    colorOverlay: z.string().nullable().optional(),
    overlayOpacity: z.number().min(0).max(80).default(0),
    enlaceDestino: z.string().nullable().optional(),
    textoBoton: z.string().max(30).nullable().optional(),
    soloMovil: z.boolean().default(false),
    soloDesktop: z.boolean().default(false),
    prioridad: z.number().min(0).max(100).default(0),
    fechaInicio: z.string().min(1, 'Requerido'),
    fechaFin: z.string().nullable().optional(),
    orden: z.number().default(0),
  })
  .refine(
    (data) => {
      const hasBoton = !!data.textoBoton?.trim()
      const hasEnlace = !!data.enlaceDestino?.trim()
      if (hasBoton && !hasEnlace) return false
      if (hasEnlace && !hasBoton) return false
      return true
    },
    {
      message:
        'Si configuras un botón, debes indicar tanto el texto como el enlace de destino.',
      path: ['enlaceDestino'],
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
      if (data.enlaceDestino && data.enlaceDestino.trim()) {
        const val = data.enlaceDestino.trim()
        return (
          val.startsWith('/') ||
          val.startsWith('http://') ||
          val.startsWith('https://')
        )
      }
      return true
    },
    {
      message:
        'Debe ser una ruta interna (empieza con /) o enlace externo válido (http/https).',
      path: ['enlaceDestino'],
    }
  )

type FormValues = z.infer<typeof schema>

interface BannerFormDrawerProps {
  open: boolean
  onClose: () => void
  banner?: Banner | null
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

export function BannerFormDrawer({
  open,
  onClose,
  banner,
}: BannerFormDrawerProps) {
  const [imagenMovilDistinta, setImagenMovilDistinta] = useState(false)
  const [selectedRouteType, setSelectedRouteType] = useState<string>('none')

  const crear = useCrearBanner()
  const actualizar = useActualizarBanner()
  const isPending = crear.isPending || actualizar.isPending

  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [imagenMovilMedia, setImagenMovilMedia] = useState<MediaValue | null>(
    null
  )
  const [uploading, setUploading] = useState(false)

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
      tipoBanner: undefined,
      titulo: '',
      descripcion: '',
      imagenUrl: '',
      imagenMovilUrl: undefined,
      colorOverlay: '#000000',
      overlayOpacity: 0,
      enlaceDestino: '',
      textoBoton: '',
      soloMovil: false,
      soloDesktop: false,
      prioridad: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      orden: 0,
    },
  })

  useEffect(() => {
    if (banner && open) {
      reset({ ...banner, overlayOpacity: 0 })
      setImagenMovilDistinta(!!banner.imagenMovilUrl)
      setImagenMedia(
        banner.imagenUrl
          ? { url: fixMediaUrl(banner.imagenUrl), esLocal: false }
          : null
      )
      setImagenMovilMedia(
        banner.imagenMovilUrl
          ? { url: fixMediaUrl(banner.imagenMovilUrl), esLocal: false }
          : null
      )

      if (banner.enlaceDestino) {
        const match = RUTAS_COMUNES.find(
          (r) => r.value === banner.enlaceDestino
        )
        if (match && match.value !== 'custom') {
          setSelectedRouteType(match.value)
        } else {
          setSelectedRouteType('custom')
        }
      } else {
        setSelectedRouteType('none')
      }
    } else if (!open) {
      reset()
      setImagenMovilDistinta(false)
      setSelectedRouteType('none')
      setImagenMedia(null)
      setImagenMovilMedia(null)
    }
  }, [banner, open, reset])

  async function onSubmit(values: FormValues) {
    setUploading(true)
    try {
      const resolvedImagenUrl = await resolverMediaValue(imagenMedia, 'banners')
      const resolvedImagenMovilUrl = await resolverMediaValue(
        imagenMovilMedia,
        'banners'
      )

      if (!resolvedImagenUrl) {
        toast.error('La imagen principal es requerida')
        return
      }

      const { overlayOpacity } = values
      const payload: CrearBannerPayload = {
        titulo: values.titulo,
        descripcion: values.descripcion ?? undefined,
        imagenUrl: resolvedImagenUrl,
        imagenMovilUrl: imagenMovilDistinta
          ? (resolvedImagenMovilUrl ?? undefined)
          : undefined,
        enlaceDestino: values.enlaceDestino ?? undefined,
        textoBoton: values.textoBoton ?? undefined,
        colorOverlay:
          overlayOpacity > 0 ? (values.colorOverlay ?? undefined) : undefined,
        tipoBanner: (values.tipoBanner ?? undefined) as TipoBanner | undefined,
        soloMovil: values.soloMovil,
        soloDesktop: values.soloDesktop,
        prioridad: values.prioridad,
        fechaInicio: values.fechaInicio,
        fechaFin: values.fechaFin ?? undefined,
        orden: values.orden,
      }
      if (banner) {
        await actualizar.mutateAsync({ id: banner.id, payload })
      } else {
        await crear.mutateAsync(payload)
      }
      onClose()
    } catch {
      toast.error('No se pudo guardar el banner')
    } finally {
      setUploading(false)
    }
  }

  const onError = (errors: any) => {
    console.error('Errores de validación:', errors)
    const firstError = Object.values(errors)[0] as { message?: string }
    if (firstError?.message) {
      toast.error(`Error de validación: ${firstError.message}`)
    } else {
      toast.error('Corrige los errores en el formulario')
    }
  }

  const titulo = watch('titulo')
  const descripcion = watch('descripcion')
  const imagenUrl = watch('imagenUrl')
  const imagenMovilUrl = watch('imagenMovilUrl')
  const colorOverlay = watch('colorOverlay')
  const overlayOpacity = watch('overlayOpacity') ?? 0
  const textoBoton = watch('textoBoton')
  const tipoBanner = watch('tipoBanner')
  const soloMovil = watch('soloMovil')
  const soloDesktop = watch('soloDesktop')

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-[960px] p-0 gap-0 flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="px-6 py-4 pr-12 border-b shrink-0">
          <DialogTitle>{banner ? 'Editar banner' : 'Nuevo banner'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid lg:grid-cols-[480px_1fr]">
          <div className="overflow-y-auto border-r">
            <form id="banner-form" onSubmit={handleSubmit(onSubmit, onError)}>
              <Accordion
                type="multiple"
                defaultValue={[
                  'clasificacion',
                  'contenido',
                  'imagen',
                  'publicacion',
                ]}
                className="px-6"
              >
                <AccordionItem value="clasificacion">
                  <AccordionTrigger>Clasificación</AccordionTrigger>
                  <AccordionContent>
                    <Controller
                      name="tipoBanner"
                      control={control}
                      render={({ field }) => (
                        <BannerTipoSelector
                          value={field.value ?? undefined}
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
                        <Label htmlFor="titulo">Título</Label>
                        <span className="text-xs text-gray-400">
                          {titulo?.length ?? 0}/60
                        </span>
                      </div>
                      <Input
                        id="titulo"
                        placeholder="Ej: Nuevo show de verano"
                        {...register('titulo')}
                      />
                      {errors.titulo && (
                        <p className="text-xs text-destructive">
                          {errors.titulo.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="descripcion">Descripción</Label>
                        <span className="text-xs text-gray-400">
                          {descripcion?.length ?? 0}/150
                        </span>
                      </div>
                      <Textarea
                        id="descripcion"
                        placeholder="Descripción opcional del banner..."
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
                            value={imagenMedia}
                            onChange={(mv) => {
                              setImagenMedia(mv)
                              field.onChange(mv?.url ?? '')
                            }}
                            uploading={uploading}
                          />
                        )}
                      />
                      {errors.imagenUrl && (
                        <p className="text-xs text-destructive">
                          {errors.imagenUrl.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        id="movil-distinta"
                        checked={imagenMovilDistinta}
                        onCheckedChange={setImagenMovilDistinta}
                      />
                      <Label
                        htmlFor="movil-distinta"
                        className="cursor-pointer font-normal"
                      >
                        Configurar imagen diferente para móvil
                      </Label>
                    </div>

                    {imagenMovilDistinta && (
                      <div className="space-y-1">
                        <Label>Imagen para móvil</Label>
                        <Controller
                          name="imagenMovilUrl"
                          control={control}
                          render={({ field }) => (
                            <MediaUploader
                              carpeta="banners"
                              aspectRatio="libre"
                              placeholder="Imagen para móvil (vertical recomendado)"
                              value={imagenMovilMedia}
                              onChange={(mv) => {
                                setImagenMovilMedia(mv)
                                field.onChange(mv?.url ?? '')
                              }}
                              uploading={uploading}
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
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="w-full"
                            />
                          )}
                        />
                        <p className="text-[11px] text-gray-400">
                          {overlayOpacity}% de opacidad
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cta">
                  <AccordionTrigger>
                    Acción CTA (Botón y Enlace)
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Destino del botón</Label>
                      <Select
                        value={selectedRouteType}
                        onValueChange={(val) => {
                          if (val === 'none') {
                            setSelectedRouteType('none')
                            setValue('enlaceDestino', '')
                            setValue('textoBoton', '')
                          } else {
                            setSelectedRouteType(val)
                            if (val === 'custom') {
                              setValue('enlaceDestino', '')
                            } else {
                              setValue('enlaceDestino', val, {
                                shouldValidate: true,
                              })
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-full rounded-xl">
                          <SelectValue placeholder="Selecciona una página destino..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            Sin botón de acción
                          </SelectItem>
                          {RUTAS_COMUNES.map((ruta) => (
                            <SelectItem key={ruta.value} value={ruta.value}>
                              {ruta.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRouteType === 'custom' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="enlaceDestino">
                          Ruta personalizada o URL externa
                        </Label>
                        <Input
                          id="enlaceDestino"
                          placeholder="Ej: /promociones/mi-evento o https://..."
                          {...register('enlaceDestino')}
                          className="rounded-xl"
                        />
                        {errors.enlaceDestino && (
                          <p className="text-xs text-destructive">
                            {errors.enlaceDestino.message}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedRouteType !== 'none' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="textoBoton">Texto del botón</Label>
                        <Input
                          id="textoBoton"
                          placeholder="Ej: Ver más, Reservar..."
                          maxLength={30}
                          {...register('textoBoton')}
                          className="rounded-xl"
                        />
                        {errors.textoBoton && (
                          <p className="text-xs text-destructive">
                            {errors.textoBoton.message}
                          </p>
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="visibilidad">
                  <AccordionTrigger>Visibilidad</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Solo móvil</Label>
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
                  <AccordionTrigger>Publicación</AccordionTrigger>
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
                          <p className="text-xs text-destructive">
                            {errors.fechaInicio.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="fechaFin">Fecha de fin</Label>
                        <Input
                          id="fechaFin"
                          type="date"
                          {...register('fechaFin')}
                        />
                        {errors.fechaFin && (
                          <p className="text-xs text-destructive">
                            {errors.fechaFin.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 w-1/2">
                      <Label htmlFor="orden">Orden de visualización</Label>
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
                imagenMovilUrl={imagenMovilUrl ?? undefined}
                titulo={titulo ?? ''}
                descripcion={descripcion ?? undefined}
                textoBoton={textoBoton ?? undefined}
                colorOverlay={
                  overlayOpacity > 0 ? (colorOverlay ?? undefined) : undefined
                }
                overlayOpacity={overlayOpacity}
                tipoBanner={tipoBanner ?? undefined}
                soloMovil={soloMovil}
                soloDesktop={soloDesktop}
              />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-white shrink-0">
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isPending || uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="banner-form"
              disabled={isPending || uploading}
              className="gap-1.5"
            >
              {(isPending || uploading) && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {banner ? 'Guardar cambios' : 'Crear banner'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
