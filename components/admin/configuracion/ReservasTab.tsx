'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarCheck, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useActualizarConfiguracion } from '@/hooks/useConfiguracion'
import { ConfiguracionSistema } from '@/types/configuracion.types'

const schema = z.object({
  ANTICIPACION_MIN_RESERVA_PUBLICA_H: z.coerce.number().int().min(0),
  PLAZO_REPROGRAMACION_H:             z.coerce.number().int().min(0),
  MAX_REPROGRAMACIONES_POR_ENTRADA:   z.coerce.number().int().min(0),
  VISITAS_PARA_ENTRADA_GRATIS:        z.coerce.number().int().min(1),
})

type FormValues = z.infer<typeof schema>

function toMap(configs: ConfiguracionSistema[]): Record<string, string> {
  return Object.fromEntries(configs.map(c => [c.clave, c.valor]))
}

interface FieldProps { label: string; suffix?: string; description?: string }

function NumericField({ id, label, suffix, description, error, ...props }: FieldProps & React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={id} type="number" min={0} className="max-w-[140px]" {...props} />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function ReservasTab({ configs }: { configs: ConfiguracionSistema[] }) {
  const actualizar = useActualizarConfiguracion()
  const map = toMap(configs)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ANTICIPACION_MIN_RESERVA_PUBLICA_H: Number(map.ANTICIPACION_MIN_RESERVA_PUBLICA_H ?? 1),
      PLAZO_REPROGRAMACION_H:             Number(map.PLAZO_REPROGRAMACION_H ?? 48),
      MAX_REPROGRAMACIONES_POR_ENTRADA:   Number(map.MAX_REPROGRAMACIONES_POR_ENTRADA ?? 1),
      VISITAS_PARA_ENTRADA_GRATIS:        Number(map.VISITAS_PARA_ENTRADA_GRATIS ?? 6),
    },
  })

  useEffect(() => {
    const m = toMap(configs)
    reset({
      ANTICIPACION_MIN_RESERVA_PUBLICA_H: Number(m.ANTICIPACION_MIN_RESERVA_PUBLICA_H ?? 1),
      PLAZO_REPROGRAMACION_H:             Number(m.PLAZO_REPROGRAMACION_H ?? 48),
      MAX_REPROGRAMACIONES_POR_ENTRADA:   Number(m.MAX_REPROGRAMACIONES_POR_ENTRADA ?? 1),
      VISITAS_PARA_ENTRADA_GRATIS:        Number(m.VISITAS_PARA_ENTRADA_GRATIS ?? 6),
    })
  }, [configs, reset])

  function onSubmit(values: FormValues) {
    actualizar.mutate({
      ANTICIPACION_MIN_RESERVA_PUBLICA_H: String(values.ANTICIPACION_MIN_RESERVA_PUBLICA_H),
      PLAZO_REPROGRAMACION_H:             String(values.PLAZO_REPROGRAMACION_H),
      MAX_REPROGRAMACIONES_POR_ENTRADA:   String(values.MAX_REPROGRAMACIONES_POR_ENTRADA),
      VISITAS_PARA_ENTRADA_GRATIS:        String(values.VISITAS_PARA_ENTRADA_GRATIS),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
          <CalendarCheck className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Reglas de reservas públicas</h3>
          <p className="text-xs text-muted-foreground">Plazos y límites para las reservas del portal</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <NumericField
          id="ANTICIPACION_MIN_RESERVA_PUBLICA_H"
          label="Anticipación mínima"
          suffix="horas"
          description="Mínimo de horas antes del turno para reservar"
          error={errors.ANTICIPACION_MIN_RESERVA_PUBLICA_H?.message}
          {...register('ANTICIPACION_MIN_RESERVA_PUBLICA_H')}
        />

        <NumericField
          id="PLAZO_REPROGRAMACION_H"
          label="Plazo de reprogramación"
          suffix="horas"
          description="Límite de horas para que el cliente reprograme"
          error={errors.PLAZO_REPROGRAMACION_H?.message}
          {...register('PLAZO_REPROGRAMACION_H')}
        />

        <NumericField
          id="MAX_REPROGRAMACIONES_POR_ENTRADA"
          label="Reprogramaciones máximas"
          suffix="por entrada"
          description="Número máximo de veces que se puede reprogramar"
          error={errors.MAX_REPROGRAMACIONES_POR_ENTRADA?.message}
          {...register('MAX_REPROGRAMACIONES_POR_ENTRADA')}
        />

        <NumericField
          id="VISITAS_PARA_ENTRADA_GRATIS"
          label="Visitas para entrada gratis"
          suffix="visitas"
          description="Cantidad de visitas acumuladas para el beneficio de fidelización"
          error={errors.VISITAS_PARA_ENTRADA_GRATIS?.message}
          {...register('VISITAS_PARA_ENTRADA_GRATIS')}
        />
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
