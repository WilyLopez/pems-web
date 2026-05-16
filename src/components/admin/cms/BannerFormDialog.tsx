'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Monitor,
  Smartphone,
  Image as ImageIcon,
  Type,
  Link2,
  Settings,
  Shield,
  Zap,
} from 'lucide-react'
import {
  Banner,
  CrearBannerPayload,
  ActualizarBannerPayload,
} from '@/services/cms.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import Image from 'next/image'

const schema = z.object({
  titulo: z.string().min(1, 'El título es obligatorio').max(200),
  descripcion: z.string().max(400).optional(),
  imagenUrl: z
    .string()
    .min(1, 'La URL de imagen es obligatoria')
    .url('Debe ser una URL válida'),
  enlaceDestino: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().optional(),
  orden: z.coerce.number().min(0).default(0),
})

type FormValues = z.infer<typeof schema>

type Device = 'desktop' | 'mobile'

interface BannerFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  banner?: Banner | null
  onSubmit: (payload: CrearBannerPayload | ActualizarBannerPayload) => void
  isLoading: boolean
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSubmit,
  isLoading,
}: BannerFormDialogProps) {
  const [device, setDevice] = useState<Device>('desktop')
  const isEditing = !!banner

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      imagenUrl: '',
      enlaceDestino: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      orden: 0,
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        banner
          ? {
              titulo: banner.titulo,
              descripcion: banner.descripcion ?? '',
              imagenUrl: banner.imagenUrl,
              enlaceDestino: banner.enlaceDestino ?? '',
              fechaInicio: banner.fechaInicio,
              fechaFin: banner.fechaFin ?? '',
              orden: banner.orden,
            }
          : {
              titulo: '',
              descripcion: '',
              imagenUrl: '',
              enlaceDestino: '',
              fechaInicio: new Date().toISOString().split('T')[0],
              fechaFin: '',
              orden: 0,
            }
      )
    }
  }, [open, banner, reset])

  const values = watch()

  function handleFormSubmit(data: FormValues) {
    const payload: CrearBannerPayload = {
      titulo: data.titulo,
      descripcion: data.descripcion || undefined,
      imagenUrl: data.imagenUrl,
      enlaceDestino: data.enlaceDestino || undefined,
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin || undefined,
      orden: data.orden,
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>
            {isEditing ? 'Editar banner' : 'Nuevo banner'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-0">
          {/* ── Formulario ── */}
          <form
            id="banner-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="px-6 py-4 space-y-5 border-r"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-brand-azul/10 flex items-center justify-center">
                  <ImageIcon className="h-3 w-3 text-brand-azul" />
                </div>
                Bloque imagen
              </div>
              <div>
                <Label htmlFor="imagenUrl">URL de imagen *</Label>
                <Input
                  id="imagenUrl"
                  placeholder="https://..."
                  {...register('imagenUrl')}
                  className="mt-1"
                />
                {errors.imagenUrl && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.imagenUrl.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-brand-rosa/10 flex items-center justify-center">
                  <Type className="h-3 w-3 text-brand-rosa" />
                </div>
                Bloque texto
              </div>
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Ej: Nuevo show de verano"
                  {...register('titulo')}
                  className="mt-1"
                />
                {errors.titulo && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.titulo.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Descripción opcional..."
                  rows={2}
                  {...register('descripcion')}
                  className="mt-1 resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-brand-amarillo/20 flex items-center justify-center">
                  <Link2 className="h-3 w-3 text-yellow-600" />
                </div>
                Bloque enlace
              </div>
              <div>
                <Label htmlFor="enlaceDestino">URL de destino</Label>
                <Input
                  id="enlaceDestino"
                  placeholder="https://..."
                  {...register('enlaceDestino')}
                  className="mt-1"
                />
                {errors.enlaceDestino && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.enlaceDestino.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                  <Settings className="h-3 w-3 text-gray-500" />
                </div>
                Configuración
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fechaInicio">Desde *</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    {...register('fechaInicio')}
                    className="mt-1"
                  />
                  {errors.fechaInicio && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.fechaInicio.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="fechaFin">Hasta</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    {...register('fechaFin')}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="w-1/2">
                <Label htmlFor="orden">Orden de visualización</Label>
                <Input
                  id="orden"
                  type="number"
                  min={0}
                  {...register('orden')}
                  className="mt-1"
                />
              </div>
            </div>
          </form>

          {/* ── Vista previa ── */}
          <div className="px-6 py-4 bg-gray-50 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vista previa
              </span>
              <div className="flex items-center gap-1 bg-white border rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-brand-azul text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Escritorio"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-brand-azul text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Móvil"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <div
                className={`bg-gradient-to-br from-[#001a2c] via-[#003a5c] to-[#001a2c] rounded-2xl overflow-hidden transition-all duration-300 ${
                  device === 'desktop'
                    ? 'w-full aspect-[4/3]'
                    : 'w-[200px] aspect-[9/16]'
                } relative flex items-center justify-center p-4`}
              >
                {values.imagenUrl ? (
                  <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-lg bg-gradient-to-br from-brand-azul/30 to-brand-rosa/30">
                    <Image
                      src={values.imagenUrl}
                      alt={values.titulo || 'Banner preview'}
                      fill
                      className="object-cover"
                      sizes="400px"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                      unoptimized
                    />
                    {values.descripcion && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {values.descripcion}
                        </p>
                      </div>
                    )}
                    {values.titulo && (
                      <div className="absolute top-2 right-2 bg-brand-amarillo text-gray-900 rounded-xl px-2 py-1 text-xs font-black shadow rotate-3 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        <span className="max-w-[80px] truncate">
                          {values.titulo}
                        </span>
                      </div>
                    )}
                    {values.enlaceDestino && (
                      <div className="absolute bottom-8 left-2 bg-white rounded-xl px-2 py-1 text-xs font-bold shadow -rotate-2 flex items-center gap-1">
                        <Shield className="h-3 w-3 text-brand-azul" />
                        Ver más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <ImageIcon className="h-8 w-8" />
                    <p className="text-xs text-center">
                      Ingresa una URL de imagen para previsualizar
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(values.titulo || values.fechaInicio) && (
              <div className="bg-white rounded-lg border p-3 space-y-1.5">
                {values.titulo && (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {values.titulo}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {values.fechaInicio && (
                    <Badge variant="secondary" className="text-xs">
                      Desde: {values.fechaInicio}
                    </Badge>
                  )}
                  {values.fechaFin && (
                    <Badge variant="secondary" className="text-xs">
                      Hasta: {values.fechaFin}
                    </Badge>
                  )}
                  {values.enlaceDestino && (
                    <Badge className="text-xs bg-brand-azul/10 text-brand-azul border-brand-azul/20">
                      Con enlace
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="banner-form"
            disabled={isLoading}
            className="bg-brand-azul hover:bg-brand-azul/90 text-white"
          >
            {isLoading
              ? 'Guardando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Crear banner'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
