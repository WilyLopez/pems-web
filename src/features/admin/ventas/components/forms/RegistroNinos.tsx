import React from 'react'
import { Plus, X } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useFormState,
  type Control,
} from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { cn } from '@/lib/utils'
import type { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'

interface RegistroNinosProps {
  control: Control<VentaMostradorFormValues>
  edadMin: number
  edadMax: number
}

export const RegistroNinos = ({
  control,
  edadMin,
  edadMax,
}: RegistroNinosProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'ninos' })
  const { errors } = useFormState({ control, name: 'ninos' })

  const addNino = () => append({ nombreNino: '', edadNino: edadMin })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Niños / Entradas <span className="text-brand-azul">({fields.length})</span>
        </Label>
        <button
          type="button"
          onClick={addNino}
          className="flex items-center gap-0.5 text-[10px] font-bold text-brand-azul hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Agregar entrada
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
        {fields.map((field, i) => {
          const errorNombre = errors?.ninos?.[i]?.nombreNino?.message
          const errorEdad = errors?.ninos?.[i]?.edadNino?.message

          return (
            <div
              key={field.id}
              className="p-2.5 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Entrada #{i + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-[9px] font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <X className="h-2.5 w-2.5" /> Quitar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_75px] gap-2">
                <Controller
                  control={control}
                  name={`ninos.${i}.nombreNino`}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      placeholder="Nombre del niño"
                      onChange={(e) => f.onChange(e.target.value.toUpperCase())}
                      className={cn(
                        'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
                        errorNombre && 'border-red-400 dark:border-red-600'
                      )}
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
                      onChange={(e) =>
                        f.onChange(
                          e.target.value === ''
                            ? 0
                            : parseInt(e.target.value, 10)
                        )
                      }
                      min={edadMin}
                      max={edadMax}
                      className={cn(
                        'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
                        errorEdad && 'border-red-400 dark:border-red-600'
                      )}
                    />
                  )}
                />
              </div>
              {(errorNombre || errorEdad) && (
                <p className="text-[9px] text-red-500 dark:text-red-400 font-bold leading-tight">
                  {errorNombre || errorEdad}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
