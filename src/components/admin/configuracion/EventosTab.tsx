'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { CalendarRange, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracionCalendario } from '@/hooks/useConfiguracion'
import { ConfiguracionCalendario } from '@/types/configuracion.types'

const schema = z.object({
  diasMinEventoPrivado: z.coerce.number().int().min(1),
  diasMaxEventoPrivado: z.coerce.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

interface Props {
  config: ConfiguracionCalendario
  idSede: number
}

export function EventosTab({ config, idSede }: Props) {
  const actualizar = useActualizarConfiguracionCalendario(idSede)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      diasMinEventoPrivado: config.diasMinEventoPrivado,
      diasMaxEventoPrivado: config.diasMaxEventoPrivado,
    },
  })

  useEffect(() => {
    reset({
      diasMinEventoPrivado: config.diasMinEventoPrivado,
      diasMaxEventoPrivado: config.diasMaxEventoPrivado,
    })
  }, [config, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      ...config,
      diasMinEventoPrivado: values.diasMinEventoPrivado,
      diasMaxEventoPrivado: values.diasMaxEventoPrivado,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
          <CalendarRange className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Eventos privados</h3>
          <p className="text-xs text-muted-foreground">
            Ventana de anticipación para solicitar eventos
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="diasMinEventoPrivado">Anticipación mínima</Label>
          <div className="flex items-center gap-2">
            <Input
              id="diasMinEventoPrivado"
              type="number"
              min={1}
              className="max-w-[120px]"
              {...register('diasMinEventoPrivado')}
            />
            <span className="text-sm text-muted-foreground">días</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Días mínimos de anticipación para solicitar un evento privado.
          </p>
          {errors.diasMinEventoPrivado && (
            <p className="text-xs text-destructive">{errors.diasMinEventoPrivado.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="diasMaxEventoPrivado">Anticipación máxima</Label>
          <div className="flex items-center gap-2">
            <Input
              id="diasMaxEventoPrivado"
              type="number"
              min={1}
              className="max-w-[120px]"
              {...register('diasMaxEventoPrivado')}
            />
            <span className="text-sm text-muted-foreground">días</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Con cuántos días de anticipación máxima se puede solicitar un evento.
          </p>
          {errors.diasMaxEventoPrivado && (
            <p className="text-xs text-destructive">{errors.diasMaxEventoPrivado.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          )}
        </Button>
      </div>
    </form>
  )
}
