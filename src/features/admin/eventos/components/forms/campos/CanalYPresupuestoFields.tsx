'use client'

import { Control, Controller, FieldErrors } from 'react-hook-form'
import {
  NuevoEventoFormValues,
  ORIGENES_CONTACTO,
} from '../../../schema/nuevoEvento.schema'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn } from '@/lib/utils'

interface CanalYPresupuestoFieldsProps {
  control: Control<NuevoEventoFormValues>
  errors: FieldErrors<NuevoEventoFormValues>
  presupuestoTocado: boolean
}

export function CanalYPresupuestoFields({
  control,
  errors,
  presupuestoTocado,
}: CanalYPresupuestoFieldsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        Canal y presupuesto
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="origenContacto"
          control={control}
          render={({ field }) => (
            <FormField id="origenContacto" label="Canal de contacto">
              {(fieldProps) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={(v) => field.onChange(v || undefined)}
                >
                  <SelectTrigger
                    {...fieldProps}
                    className="rounded-xl dark:bg-gray-800 dark:border-gray-700"
                  >
                    <SelectValue placeholder="¿Cómo contactó el cliente?" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGENES_CONTACTO.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          )}
        />

        <Controller
          name="presupuestoEstimado"
          control={control}
          render={({ field }) => (
            <FormField
              id="presupuestoEstimado"
              label="Presupuesto estimado (S/)"
              error={errors.presupuestoEstimado?.message}
              hint={
                !presupuestoTocado && field.value !== undefined
                  ? 'Sugerido por el paquete, puedes ajustarlo.'
                  : undefined
              }
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  type="number"
                  min={0}
                  step={0.01}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    field.onChange(isNaN(v) ? undefined : v)
                  }}
                  placeholder="0.00"
                  className={cn(
                    'dark:bg-gray-800 dark:border-gray-700',
                    errors.presupuestoEstimado &&
                      'border-red-400 focus-visible:ring-red-300'
                  )}
                />
              )}
            </FormField>
          )}
        />
      </div>
    </div>
  )
}
