'use client'

import { Control, Controller, UseFormSetValue } from 'react-hook-form'
import { NuevoEventoFormValues } from '../../../schema/nuevoEvento.schema'
import { PaqueteEvento, TipoEvento } from '@/types/comercial.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { formatCurrency } from '@/lib/utils'

interface PaqueteSelectorProps {
  control: Control<NuevoEventoFormValues>
  setValue: UseFormSetValue<NuevoEventoFormValues>
  tipoEventoSel: TipoEvento | null
  paquetesFiltrados: PaqueteEvento[]
  loadingPaquetes: boolean
  aforoTocado: boolean
  presupuestoTocado: boolean
}

export function PaqueteSelector({
  control,
  setValue,
  tipoEventoSel,
  paquetesFiltrados,
  loadingPaquetes,
  aforoTocado,
  presupuestoTocado,
}: PaqueteSelectorProps) {
  const sinPaquetesParaElTipo =
    !loadingPaquetes && !!tipoEventoSel && paquetesFiltrados.length === 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Paquete
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {tipoEventoSel
            ? `Mostrando paquetes para ${tipoEventoSel.nombre}`
            : 'Opcional — puede asignarse después'}
        </p>
      </div>
      <Controller
        name="idPaquete"
        control={control}
        render={({ field }) => (
          <Select
            value={field.value?.toString() ?? ''}
            disabled={loadingPaquetes || sinPaquetesParaElTipo}
            onValueChange={(v) => {
              const idPaquete = v ? parseInt(v, 10) : undefined
              field.onChange(idPaquete)

              const paquete = paquetesFiltrados.find((p) => p.id === idPaquete)
              if (paquete?.limitepersonas && !aforoTocado) {
                setValue('aforoDeclarado', paquete.limitepersonas, {
                  shouldValidate: true,
                })
              }
              if (paquete && paquete.precio > 0 && !presupuestoTocado) {
                setValue('presupuestoEstimado', paquete.precio, {
                  shouldValidate: true,
                })
              }
            }}
          >
            <SelectTrigger className="rounded-xl dark:bg-gray-800 dark:border-gray-700">
              <SelectValue
                placeholder={
                  loadingPaquetes
                    ? 'Cargando paquetes...'
                    : sinPaquetesParaElTipo
                      ? 'No hay paquetes disponibles para este tipo de evento'
                      : 'Sin paquete seleccionado'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {paquetesFiltrados.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.nombre}
                  {p.precio ? ` · ${formatCurrency(p.precio)}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}
