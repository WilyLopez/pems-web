'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Building2, ExternalLink, Loader2, Map, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSede, useActualizarSede } from '../../hooks/useConfiguracionData'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import type { Sede } from '../../types'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'
import { GoogleMapEmbed } from '@/features/public/shared/components/GoogleMapEmbed'

const schema = z.object({
  nombre: z.string().min(2).max(120),
  ciudad: z.string().min(2).max(80),
  departamento: z.string().min(2).max(80),
  ruc: z
    .string()
    .length(11, 'El RUC debe tener 11 dígitos')
    .optional()
    .or(z.literal('')),
  latitud: z.number().nullable().optional(),
  longitud: z.number().nullable().optional(),
  googleMapsEmbedUrl: z
    .string()
    .refine(
      (v) => v === '' || v.startsWith('https://www.google.com/maps/embed'),
      'Debe ser un enlace de inserción (embed) de Google Maps'
    )
    .optional(),
})

type FormValues = z.infer<typeof schema>

function SedeForm({ idSede }: { idSede: number }) {
  const { data: sede, isLoading } = useSede(idSede)
  const actualizar = useActualizarSede(idSede)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const googleMapsEmbedUrl = watch('googleMapsEmbedUrl')
  const embedValido =
    !!googleMapsEmbedUrl &&
    googleMapsEmbedUrl.startsWith('https://www.google.com/maps/embed')

  useEffect(() => {
    if (!sede) return
    reset({
      nombre: sede.nombre,
      ciudad: sede.ciudad,
      departamento: sede.departamento,
      ruc: sede.ruc ?? '',
      latitud: sede.latitud,
      longitud: sede.longitud,
      googleMapsEmbedUrl: sede.googleMapsEmbedUrl ?? '',
    })
  }, [sede, reset])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      nombre: values.nombre,
      ciudad: values.ciudad,
      departamento: values.departamento,
      ruc: values.ruc || null,
      latitud: values.latitud ?? null,
      longitud: values.longitud ?? null,
      googleMapsEmbedUrl: values.googleMapsEmbedUrl || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="nombre">Nombre del local</Label>
          <Input id="nombre" {...register('nombre')} />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input id="ciudad" placeholder="Chiclayo" {...register('ciudad')} />
          {errors.ciudad && (
            <p className="text-xs text-destructive">{errors.ciudad.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departamento">Departamento</Label>
          <Input
            id="departamento"
            placeholder="Lambayeque"
            {...register('departamento')}
          />
          {errors.departamento && (
            <p className="text-xs text-destructive">
              {errors.departamento.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ruc">RUC</Label>
          <Input
            id="ruc"
            placeholder="20123456789"
            maxLength={11}
            {...register('ruc')}
          />
          {errors.ruc && (
            <p className="text-xs text-destructive">{errors.ruc.message}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Map className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-card-foreground">
              Mapa insertado de Google Maps
            </p>
            <p className="text-xs text-muted-foreground">
              Mapa visible en la página de Contacto
            </p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="googleMapsEmbedUrl">Enlace de inserción</Label>
          <Input
            id="googleMapsEmbedUrl"
            placeholder="https://www.google.com/maps/embed?pb=..."
            {...register('googleMapsEmbedUrl')}
          />
          {errors.googleMapsEmbedUrl && (
            <p className="text-xs text-destructive">
              {errors.googleMapsEmbedUrl.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            En Google Maps: Compartir → Insertar un mapa → copiar solo el
            enlace &apos;src&apos; del código.
          </p>
          <a
            href="https://support.google.com/maps/answer/144361"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-azul hover:underline"
          >
            ¿Cómo obtener este enlace?
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {embedValido && (
          <div className="mt-3 overflow-hidden rounded-lg border border-border h-64">
            <GoogleMapEmbed
              src={googleMapsEmbedUrl!}
              title="Vista previa del mapa"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          size="sm"
        >
          {actualizar.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function SedeViewContent({ sede }: { sede: Sede | undefined }) {
  if (!sede)
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Sin datos.
      </p>
    )
  return (
    <ReadOnlyList
      items={[
        { label: 'Nombre', value: sede.nombre },
        { label: 'Ciudad', value: sede.ciudad },
        { label: 'Departamento', value: sede.departamento },
        { label: 'RUC', value: sede.ruc ?? '—' },
        {
          label: 'Mapa embebido',
          value: sede.googleMapsEmbedUrl ? 'Configurado' : 'Sin configurar',
        },
      ]}
    />
  )
}

export function SedeSection({
  idSede,
  navProps,
}: {
  idSede: number
  navProps?: SeccionNavProps
}) {
  const { data: sede } = useSede(idSede)

  const summary = sede
    ? [
        { label: 'Nombre', value: sede.nombre },
        { label: 'Ciudad', value: sede.ciudad },
        { label: 'RUC', value: sede.ruc ?? '—' },
        {
          label: 'Mapa',
          value: sede.googleMapsEmbedUrl ? 'Configurado' : 'Sin configurar',
        },
      ]
    : []

  return (
    <ModuleCard
      icon={Building2}
      color="bg-blue-50 text-blue-600"
      title="Datos de la sede"
      description="Nombre, ciudad, RUC y mapa del local"
      summary={summary}
      editSize="sm:max-w-xl"
      viewContent={<SedeViewContent sede={sede} />}
      editContent={<SedeForm idSede={idSede} />}
      navProps={navProps}
    />
  )
}
