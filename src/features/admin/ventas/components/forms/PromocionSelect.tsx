import React from 'react'
import { Controller, Control } from 'react-hook-form'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'

interface PromocionSelectProps {
  control: Control<VentaMostradorFormValues>
  promociones?: any[]
}

export const PromocionSelect = ({
  control,
  promociones,
}: PromocionSelectProps) => {
  if (!promociones || promociones.length === 0) return null

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
        Promoción
      </Label>
      <Controller
        control={control}
        name="idPromocion"
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : 'ninguna'}
            onValueChange={(v) =>
              field.onChange(v === 'ninguna' ? null : parseInt(v, 10))
            }
          >
            <SelectTrigger className="h-9 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ninguna">Sin promoción</SelectItem>
              {promociones
                .filter((p) => p.activo)
                .map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}
