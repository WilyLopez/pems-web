'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarRange, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracion } from '@/hooks/useConfiguracion'
import { ConfiguracionSistema } from '@/types/configuracion.types'

const schema = z.object({
  ANTICIPACION_MIN_EVENTO_PRIVADO_D: z.coerce.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map(c => [c.clave, c.valor]))
}

export function EventosTab({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const map = toMap(configs)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ANTICIPACION_MIN_EVENTO_PRIVADO_D: Number(map.ANTICIPACION_MIN_EVENTO_PRIVADO_D ?? 15),
    },
  })

  useEffect(() => {
    const m = toMap(configs)
    reset({ ANTICIPACION_MIN_EVENTO_PRIVADO_D: Number(m.ANTICIPACION_MIN_EVENTO_PRIVADO_D ?? 15) })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({ ANTICIPACION_MIN_EVENTO_PRIVADO_D: String(values.ANTICIPACION_MIN_EVENTO_PRIVADO_D) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
          <CalendarRange className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Eventos privados</h3>
          <p className="text-xs text-muted-foreground">Parámetros de anticipación para contratación de eventos</p>
        </div>
      </div>

      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="ANTICIPACION_MIN_EVENTO_PRIVADO_D">Anticipación mínima para solicitar un evento</Label>
        <div className="flex items-center gap-2">
          <Input
            id="ANTICIPACION_MIN_EVENTO_PRIVADO_D"
            type="number"
            min={1}
            className="max-w-[120px]"
            {...register('ANTICIPACION_MIN_EVENTO_PRIVADO_D')}
          />
          <span className="text-sm text-muted-foreground">días antes del evento</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Los clientes deben solicitar el evento con al menos este número de días de antelación.
        </p>
        {errors.ANTICIPACION_MIN_EVENTO_PRIVADO_D && (
          <p className="text-xs text-destructive">{errors.ANTICIPACION_MIN_EVENTO_PRIVADO_D.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
            : <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          }
        </Button>
      </div>
    </form>
  )
}
