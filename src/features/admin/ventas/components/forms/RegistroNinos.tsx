import React from 'react'
import { Plus, X } from 'lucide-react'
import { Controller, useFieldArray, useFormState, type Control } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'
import type { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'

interface RegistroNinosProps {
  control: Control<VentaMostradorFormValues>
  edadMin: number
  edadMax: number
}

export const RegistroNinos = ({ control, edadMin, edadMax }: RegistroNinosProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'ninos' })
  const { errors } = useFormState({ control, name: 'ninos' })

  const addNino = () => append({ nombreNino: '', edadNino: edadMin })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
          Niños <span className="text-brand-azul">({fields.length})</span>
        </Label>
        <button
          type="button"
          onClick={addNino}
          className="flex items-center gap-1 text-[10px] font-bold text-brand-azul hover:underline"
        >
          <Plus className="h-3 w-3" /> Agregar
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, i) => {
          const errorNombre = errors?.ninos?.[i]?.nombreNino?.message
          const errorEdad = errors?.ninos?.[i]?.edadNino?.message

          return (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name={`ninos.${i}.nombreNino`}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="Nombre completo"
                      onChange={(e) => f.onChange(e.target.value.toUpperCase())}
                      className={cn('h-8 text-xs flex-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', errorNombre && 'border-red-400 dark:border-red-600')}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`ninos.${i}.edadNino`}
                  render={({ field: f }) => (
                    <Input
                      type="number"
                      placeholder="Edad"
                      value={f.value === 0 ? '' : f.value}
                      onChange={(e) => f.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                      min={edadMin}
                      max={edadMax}
                      className={cn('h-8 text-xs w-16 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700', errorEdad && 'border-red-400 dark:border-red-600')}
                    />
                  )}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {(errorNombre || errorEdad) && (
                <p className="text-[10px] text-red-500 dark:text-red-400 pl-1">{errorNombre || errorEdad}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
