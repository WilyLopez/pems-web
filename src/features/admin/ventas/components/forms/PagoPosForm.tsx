'use client'

import React, { useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
  type Control,
} from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { formatCurrency, cn } from '@/lib/utils'
import { PagoLinea } from '../../types'
import {
  METODOS_PAGO,
  type VentaMostradorFormValues,
} from '../../schema/ventaMostrador.schema'
import {
  calcularResumenPagos,
  DENOMINACIONES_EFECTIVO,
} from '../../utils/ventas.utils'

interface PagoPosFormProps {
  control: Control<VentaMostradorFormValues>
  total: number
}

const METODOS: { value: (typeof METODOS_PAGO)[number]; label: string }[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
]

export const PagoPosForm = ({ control, total }: PagoPosFormProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'pagos' })
  const pagos = useWatch({ control, name: 'pagos' }) as PagoLinea[]
  const efectivoRecibido = useWatch({
    control,
    name: 'efectivoRecibido',
  }) as number
  const [otroMonto, setOtroMonto] = useState('')

  const { errors } = useFormState({
    control,
    name: ['pagos', 'efectivoRecibido'],
  })

  const addPago = () => {
    const usados = new Set(pagos?.map((p) => p.medioPago) || [])
    const disponible = METODOS.find((m) => !usados.has(m.value))
    if (!disponible) return
    append({ medioPago: disponible.value, monto: 0 })
  }

  const { sumaPagos, vuelto, saldo } = calcularResumenPagos(
    pagos || [],
    efectivoRecibido || 0,
    total
  )

  const tieneEfectivo = pagos.some(
    (p) => p.medioPago === 'EFECTIVO' && p.monto > 0
  )
  const efectivoMonto =
    pagos.find((p) => p.medioPago === 'EFECTIVO')?.monto ?? 0
  const todosUsados = (pagos?.length ?? 0) >= METODOS.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">
          Pagos
        </Label>
        {!todosUsados && (
          <button
            type="button"
            onClick={addPago}
            className="flex items-center gap-1 text-[10px] font-bold text-brand-azul hover:underline"
          >
            <Plus className="h-3 w-3" /> Dividir pago
          </button>
        )}
      </div>

      <div className="space-y-2">
        {fields.map((field, i) => {
          const errorMonto = errors?.pagos?.[i]?.monto?.message
          
          const montoOtrasLineas = (pagos || []).reduce(
            (s, p, idx) => (idx === i ? s : s + (p.monto || 0)),
            0
          )
          const saldoLinea = Math.max(
            0,
            Math.round((total - montoOtrasLineas) * 100) / 100
          )
          return (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name={`pagos.${i}.medioPago`}
                  render={({ field: f }) => (
                    <Select value={f.value} onValueChange={f.onChange}>
                      <SelectTrigger className="h-8 text-xs w-32 shrink-0 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METODOS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Controller
                  control={control}
                  name={`pagos.${i}.monto`}
                  render={({ field: f }) => (
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={f.value || ''}
                        onChange={(e) =>
                          f.onChange(parseFloat(e.target.value) || 0)
                        }
                        className={cn(
                          'h-8 text-xs w-full pr-14 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
                          errorMonto && 'border-red-400 dark:border-red-600'
                        )}
                      />
                      {saldoLinea > 0 && f.value !== saldoLinea && (
                        <button
                          type="button"
                          onClick={() => f.onChange(saldoLinea)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-brand-azul/40 text-[9px] font-bold text-brand-azul hover:bg-brand-azul/5 dark:hover:bg-brand-azul/10 transition-colors"
                          title={`Cobrar el saldo pendiente (S/${saldoLinea.toFixed(2)}) con este medio`}
                        >
                          Exacto
                        </button>
                      )}
                    </div>
                  )}
                />
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {errorMonto && (
                <p className="text-[10px] text-red-500 dark:text-red-400 pl-1">
                  {errorMonto}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {tieneEfectivo && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">
              Efectivo recibido
            </Label>
            <span className="text-xs font-bold text-brand-azul">
              {formatCurrency(efectivoRecibido)}
            </span>
          </div>

          <Controller
            control={control}
            name="efectivoRecibido"
            render={({ field: f }) => {
              const agregarOtro = () => {
                const parsed = parseFloat(otroMonto)
                if (!isNaN(parsed) && parsed > 0) {
                  f.onChange((f.value || 0) + parsed)
                  setOtroMonto('')
                }
              }
              return (
                <div className="space-y-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {DENOMINACIONES_EFECTIVO.map((monto) => (
                      <button
                        key={monto}
                        type="button"
                        onClick={() => f.onChange((f.value || 0) + monto)}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-bold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        S/{monto}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => f.onChange(efectivoMonto)}
                      className="px-2.5 py-1 rounded-lg border border-brand-azul/40 text-[10px] font-bold text-brand-azul hover:bg-brand-azul/5 dark:hover:bg-brand-azul/10 transition-colors"
                    >
                      Exacto
                    </button>
                    <button
                      type="button"
                      onClick={() => f.onChange(0)}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800 text-[10px] font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <Input
                      type="number"
                      placeholder="Otro monto"
                      value={otroMonto}
                      onChange={(e) => setOtroMonto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarOtro()
                        }
                      }}
                      className="h-7 w-24 text-[10px] px-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={agregarOtro}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-[10px] font-bold text-brand-azul hover:bg-brand-azul/5 dark:hover:bg-brand-azul/10 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )
            }}
          />

          {vuelto > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">
                Vuelto
              </span>
              <span className="text-sm font-black text-green-600 dark:text-green-400">
                {formatCurrency(vuelto)}
              </span>
            </div>
          )}
        </div>
      )}

      {sumaPagos > 0 && Math.abs(sumaPagos - total) > 0.01 && (
        <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 text-center">
          {sumaPagos < total
            ? `Falta cobrar ${formatCurrency(saldo)}`
            : `Sobra ${formatCurrency(sumaPagos - total)}`}
        </p>
      )}
    </div>
  )
}
