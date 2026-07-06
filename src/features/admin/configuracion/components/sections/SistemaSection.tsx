'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Settings, AlertTriangle, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { cn } from '@/lib/utils'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracionPublica,
} from '@/hooks/useConfiguracionPublica'
import type { SeccionNavProps } from '../../hooks/useConfiguracionNav'
import { ReadOnlyList } from '../shared/ReadOnlyList'
import { ModuleCard } from '../shared/ModuleCard'

const schema = z.object({
  mantenimientoActivo: z.boolean(),
  mensajeMantenimiento: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

function SistemaForm() {
  const { data: config } = useConfiguracionAdmin()
  const actualizarPublica = useActualizarConfiguracionPublica()

  const [pendingActivar, setPendingActivar] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mantenimientoActivo: false,
      mensajeMantenimiento: '',
    },
  })

  useEffect(() => {
    if (config) {
      reset({
        mantenimientoActivo: config.mantenimientoActivo,
        mensajeMantenimiento: config.mensajeMantenimiento ?? '',
      })
    }
  }, [config, reset])

  const activo = watch('mantenimientoActivo')
  const isPending = actualizarPublica.isPending

  function onSubmit(values: FormValues) {
    if (!config) return
    actualizarPublica.mutate({
      ...config,
      mantenimientoActivo: values.mantenimientoActivo,
      mensajeMantenimiento: values.mensajeMantenimiento,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      <div
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border',
          activo
            ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800'
            : 'border-border bg-muted/40'
        )}
      >
        <AlertTriangle
          className={cn(
            'h-4 w-4 shrink-0 mt-0.5',
            activo ? 'text-amber-500' : 'text-gray-400'
          )}
        />
        <div>
          <p
            className={cn(
              'text-sm font-medium',
              activo
                ? 'text-amber-800 dark:text-amber-300'
                : 'text-card-foreground'
            )}
          >
            Modo mantenimiento
          </p>
          <p
            className={cn(
              'text-xs mt-0.5',
              activo ? 'text-amber-700' : 'text-muted-foreground'
            )}
          >
            {activo
              ? 'El sitio está en mantenimiento. Solo los administradores tienen acceso.'
              : 'El sitio está activo y visible para todos los visitantes.'}
          </p>
        </div>
        <Controller
          name="mantenimientoActivo"
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                if (checked && !field.value) {
                  setPendingActivar(true)
                } else {
                  field.onChange(checked)
                }
              }}
              className={
                field.value
                  ? 'data-[state=checked]:bg-amber-500 ml-auto'
                  : 'ml-auto'
              }
            />
          )}
        />
      </div>

      {activo && (
        <div className="space-y-1.5">
          <Label htmlFor="mensajeMantenimiento">
            Mensaje para los visitantes
          </Label>
          <Textarea
            id="mensajeMantenimiento"
            {...register('mensajeMantenimiento')}
            rows={3}
            className="resize-none"
            placeholder="Estamos mejorando el sitio para ti. Volvemos pronto..."
          />
          <p className="text-xs text-muted-foreground">
            Visible para todos los visitantes mientras el modo esté activo.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={isPending || !isDirty} size="sm">
          {isPending ? (
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

      <ConfirmDialog
        open={pendingActivar}
        onOpenChange={(v) => !v && setPendingActivar(false)}
        title="Activar modo mantenimiento"
        description="El sitio quedará inaccesible para los visitantes hasta que desactives este modo manualmente. ¿Deseas continuar?"
        confirmLabel="Activar mantenimiento"
        destructive
        onConfirm={() => {
          setValue('mantenimientoActivo', true, { shouldDirty: true })
          setPendingActivar(false)
        }}
      />
    </form>
  )
}

export function SistemaSection({ navProps }: { navProps?: SeccionNavProps }) {
  const { data: config } = useConfiguracionAdmin()
  const activo = config?.mantenimientoActivo ?? false

  const summary = [
    {
      label: 'Estado del sitio',
      value: activo ? 'En mantenimiento' : 'Activo',
    },
  ]

  const viewItems = [
    ...summary,
    ...(activo && config?.mensajeMantenimiento
      ? [{ label: 'Mensaje', value: config.mensajeMantenimiento }]
      : []),
  ]

  return (
    <ModuleCard
      icon={Settings}
      color="bg-amber-50 text-amber-600"
      title="Mantenimiento del sitio"
      description="Activa o desactiva el modo mantenimiento del sitio público"
      summary={summary}
      editSize="sm:max-w-md"
      viewContent={<ReadOnlyList items={viewItems} />}
      editContent={<SistemaForm />}
      navProps={navProps}
    />
  )
}
