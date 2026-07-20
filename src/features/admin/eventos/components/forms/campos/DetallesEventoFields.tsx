'use client'

import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form'
import { NuevoEventoFormValues } from '../../../schema/nuevoEvento.schema'
import { TipoEvento } from '@/types/comercial.types'
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

const CODIGO_CUMPLEANOS = 'CUMPLEANOS'

interface DetallesEventoFieldsProps {
  control: Control<NuevoEventoFormValues>
  errors: FieldErrors<NuevoEventoFormValues>
  setValue: UseFormSetValue<NuevoEventoFormValues>
  tiposEvento: TipoEvento[]
  loadingTiposEvento: boolean
  tipoEventoSel: TipoEvento | null
  onTipoEventoChange: (tipo: TipoEvento | null) => void
  edadMin: number
  edadMax: number
  aforoMax: number
  aforoMaximoConfig?: number
  aforoTocado: boolean
}

export function DetallesEventoFields({
  control,
  errors,
  setValue,
  tiposEvento,
  loadingTiposEvento,
  tipoEventoSel,
  onTipoEventoChange,
  edadMin,
  edadMax,
  aforoMax,
  aforoMaximoConfig,
  aforoTocado,
}: DetallesEventoFieldsProps) {
  const esCumpleanos = tipoEventoSel?.codigo === CODIGO_CUMPLEANOS

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        Detalles del evento
      </h2>

      <Controller
        name="tipoEvento"
        control={control}
        render={({ field, fieldState }) => (
          <FormField
            id="tipoEvento"
            label="Tipo de evento"
            required
            error={fieldState.error?.message}
          >
            {(fieldProps) => (
              <Select
                value={field.value ?? ''}
                disabled={loadingTiposEvento}
                onValueChange={(v) => {
                  field.onChange(v)
                  const tipo = tiposEvento.find((t) => t.codigo === v) ?? null
                  onTipoEventoChange(tipo)
                  setValue('idPaquete', undefined)
                  if (tipo?.codigo !== CODIGO_CUMPLEANOS) {
                    setValue('nombreNino', undefined)
                    setValue('edadCumple', undefined)
                  }
                }}
              >
                <SelectTrigger
                  {...fieldProps}
                  className={cn(
                    'rounded-xl dark:bg-gray-800 dark:border-gray-700',
                    fieldState.error && 'border-red-400'
                  )}
                >
                  <SelectValue
                    placeholder={
                      loadingTiposEvento
                        ? 'Cargando tipos de evento...'
                        : 'Selecciona el tipo de evento'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {tiposEvento.map((t) => (
                    <SelectItem key={t.codigo} value={t.codigo}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        )}
      />

      {esCumpleanos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="nombreNino"
            control={control}
            render={({ field }) => (
              <FormField
                id="nombreNino"
                label="Nombre del niño"
                required
                error={errors.nombreNino?.message}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    {...field}
                    value={field.value ?? ''}
                    className={cn(
                      'dark:bg-gray-800 dark:border-gray-700',
                      errors.nombreNino &&
                        'border-red-400 focus-visible:ring-red-300'
                    )}
                  />
                )}
              </FormField>
            )}
          />

          <Controller
            name="edadCumple"
            control={control}
            render={({ field }) => (
              <FormField
                id="edadCumple"
                label="Edad que cumple"
                required
                error={errors.edadCumple?.message}
                hint={`Entre ${edadMin} y ${edadMax} años.`}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    min={edadMin}
                    max={edadMax}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10)
                      field.onChange(isNaN(v) ? undefined : v)
                    }}
                    placeholder={`${edadMin}–${edadMax}`}
                    className={cn(
                      'dark:bg-gray-800 dark:border-gray-700',
                      errors.edadCumple &&
                        'border-red-400 focus-visible:ring-red-300'
                    )}
                  />
                )}
              </FormField>
            )}
          />
        </div>
      )}

      <Controller
        name="aforoDeclarado"
        control={control}
        render={({ field }) => (
          <FormField
            id="aforoDeclarado"
            label={
              <>
                Aforo estimado
                {aforoMaximoConfig && (
                  <span className="ml-1 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                    (máx. {aforoMaximoConfig})
                  </span>
                )}
              </>
            }
            error={errors.aforoDeclarado?.message}
            hint={
              !aforoTocado && field.value !== undefined
                ? 'Sugerido por el paquete, puedes ajustarlo.'
                : undefined
            }
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="number"
                min={1}
                max={aforoMax}
                value={field.value ?? ''}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10)
                  field.onChange(isNaN(v) ? undefined : v)
                }}
                placeholder="Número de invitados"
                className={cn(
                  'dark:bg-gray-800 dark:border-gray-700',
                  errors.aforoDeclarado &&
                    'border-red-400 focus-visible:ring-red-300'
                )}
              />
            )}
          </FormField>
        )}
      />
    </div>
  )
}
