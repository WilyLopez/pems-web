'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Building2, CheckCircle2, Loader2, MapPin, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSede, useActualizarSede } from '../../hooks/useConfiguracionData'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import type { Sede } from '../../types'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'

const MapaPickerDynamic = dynamic(
  () => import('./MapaPicker').then((m) => ({ default: m.MapaPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[280px] w-full animate-pulse bg-muted rounded-xl" />
    ),
  }
)

const schema = z.object({
  nombre: z.string().min(2).max(120),
  ciudad: z.string().min(2).max(80),
  departamento: z.string().min(2).max(80),
  ruc: z
    .string()
    .length(11, 'El RUC debe tener 11 dígitos')
    .optional()
    .or(z.literal('')),
  latitud: z
    .string()
    .refine(
      (v) =>
        v === '' ||
        (!isNaN(parseFloat(v)) && parseFloat(v) >= -90 && parseFloat(v) <= 90),
      'Debe estar entre -90 y 90'
    )
    .optional(),
  longitud: z
    .string()
    .refine(
      (v) =>
        v === '' ||
        (!isNaN(parseFloat(v)) &&
          parseFloat(v) >= -180 &&
          parseFloat(v) <= 180),
      'Debe estar entre -180 y 180'
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
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const latVal = watch('latitud')
  const lngVal = watch('longitud')
  const latNum = latVal ? parseFloat(latVal) : null
  const lngNum = lngVal ? parseFloat(lngVal) : null

  useEffect(() => {
    if (!sede) return
    reset({
      nombre: sede.nombre,
      ciudad: sede.ciudad,
      departamento: sede.departamento,
      ruc: sede.ruc ?? '',
      latitud: sede.latitud != null ? String(sede.latitud) : '',
      longitud: sede.longitud != null ? String(sede.longitud) : '',
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
      latitud: values.latitud ? parseFloat(values.latitud) : null,
      longitud: values.longitud ? parseFloat(values.longitud) : null,
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-card-foreground">
                Ubicación en el mapa
              </p>
              <p className="text-xs text-muted-foreground">
                {latNum != null
                  ? 'Arrastra el pin para ajustar la posición'
                  : 'Haz clic en el mapa para colocar el pin'}
              </p>
            </div>
          </div>
          {latNum != null && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground h-7 px-2"
              onClick={() => {
                setValue('latitud', '', { shouldDirty: true })
                setValue('longitud', '', { shouldDirty: true })
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <MapaPickerDynamic
            latitud={latNum}
            longitud={lngNum}
            onChange={(lat, lng) => {
              setValue('latitud', String(parseFloat(lat.toFixed(7))), {
                shouldDirty: true,
                shouldValidate: true,
              })
              setValue('longitud', String(parseFloat(lng.toFixed(7))), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }}
          />
        </div>
        {latNum != null && lngNum != null && (
          <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-green-100 bg-green-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            <div>
              <p className="text-xs font-semibold text-green-800">
                Ubicación registrada
              </p>
              <p className="font-mono text-xs text-green-600 tabular-nums">
                {latNum.toFixed(6)}, {lngNum.toFixed(6)}
              </p>
            </div>
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
  const coords =
    sede.latitud != null && sede.longitud != null
      ? `${sede.latitud}, ${sede.longitud}`
      : '—'
  return (
    <ReadOnlyList
      items={[
        { label: 'Nombre', value: sede.nombre },
        { label: 'Ciudad', value: sede.ciudad },
        { label: 'Departamento', value: sede.departamento },
        { label: 'RUC', value: sede.ruc ?? '—' },
        { label: 'Coordenadas', value: coords },
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
          value: sede.latitud != null ? 'Configurado' : 'Sin coordenadas',
        },
      ]
    : []

  return (
    <ModuleCard
      icon={Building2}
      color="bg-blue-50 text-blue-600"
      title="Datos de la sede"
      description="Nombre, ciudad, RUC y coordenadas del mapa"
      summary={summary}
      editSize="sm:max-w-xl"
      viewContent={<SedeViewContent sede={sede} />}
      editContent={<SedeForm idSede={idSede} />}
      navProps={navProps}
    />
  )
}
