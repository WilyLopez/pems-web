'use client'

import React, { useState } from 'react'
import { Plus, X, Landmark, Receipt, Coins, QrCode, CreditCard } from 'lucide-react'
import {
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
  useFormContext,
  type Control,
} from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { formatCurrency, cn } from '@/lib/utils'
import { PagoLinea, MetodoPago } from '../../types'
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

const METODOS: { value: (typeof METODOS_PAGO)[number]; label: string; icon: any }[] = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: Coins },
  { value: 'YAPE', label: 'Yape', icon: QrCode },
  { value: 'PLIN', label: 'Plin', icon: QrCode },
  { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: Landmark },
]

export const PagoPosForm = ({ control, total }: PagoPosFormProps) => {
  const { setValue, watch } = useFormContext()
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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Método de Pago
        </Label>
        {!todosUsados && (
          <button
            type="button"
            onClick={addPago}
            className="flex items-center gap-0.5 text-[10px] font-bold text-brand-azul hover:underline"
          >
            <Plus className="h-3.5 w-3.5" /> Split Pago
          </button>
        )}
      </div>

      <div className="space-y-3">
        {fields.map((field, i) => {
          const currentMedio = watch(`pagos.${i}.medioPago`) as MetodoPago
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
            <div
              key={field.id}
              className="p-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Línea de pago #{i + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-[9px] font-bold text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5"
                  >
                    <X className="h-2.5 w-2.5" /> Eliminar
                  </button>
                )}
              </div>

              <div className="flex gap-1 flex-wrap">
                {METODOS.map((m) => {
                  const IconComponent = m.icon
                  const isSelected = currentMedio === m.value
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setValue(`pagos.${i}.medioPago`, m.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                        setValue(`pagos.${i}.referencia`, '', { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                        setValue(`pagos.${i}.monto`, saldoLinea, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
                      }}
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 transition-all',
                        isSelected
                          ? 'bg-brand-azul text-white border-brand-azul'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:bg-gray-100'
                      )}
                    >
                      <IconComponent className="h-3 w-3 shrink-0" />
                      {m.label}
                    </button>
                  )
                })}
              </div>

              <div className={cn(
                "grid gap-2.5",
                currentMedio === 'EFECTIVO' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[160px_1fr]"
              )}>
                <div className={cn("space-y-1", currentMedio === 'EFECTIVO' && "max-w-[160px] w-full")}>
                  <Label className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                    Monto a Cobrar
                  </Label>
                  <div className="relative">
                    <Controller
                      control={control}
                      name={`pagos.${i}.monto`}
                      render={({ field: f }) => (
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={f.value || ''}
                          onChange={(e) =>
                            f.onChange(parseFloat(e.target.value) || 0)
                          }
                          onWheel={(e) => e.currentTarget.blur()}
                          className={cn(
                            'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 pr-12 w-full',
                            errorMonto && 'border-red-400 dark:border-red-600'
                          )}
                        />
                      )}
                    />
                    {saldoLinea > 0 && pagos[i]?.monto !== saldoLinea && (
                      <button
                        type="button"
                        onClick={() => setValue(`pagos.${i}.monto`, saldoLinea, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                        className="absolute right-1 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-brand-azul/40 text-[8px] font-black text-brand-azul bg-brand-azul/5 hover:bg-brand-azul/10"
                      >
                        Saldo
                      </button>
                    )}
                  </div>
                </div>

                {currentMedio !== 'EFECTIVO' && (
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                      {currentMedio === 'YAPE' || currentMedio === 'PLIN'
                        ? 'Nro. de Operación (Opcional)'
                        : 'Referencia / Operación (Opcional)'}
                    </Label>
                    <Controller
                      control={control}
                      name={`pagos.${i}.referencia`}
                      render={({ field: f }) => (
                        <Input
                          {...f}
                          placeholder="Operación"
                          className="h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 w-full"
                        />
                      )}
                    />
                  </div>
                )}
              </div>

              {errorMonto && (
                <p className="text-[9px] text-red-500 dark:text-red-400 font-bold">
                  {errorMonto}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {tieneEfectivo && (
        <div className="p-3 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Efectivo Recibido
            </Label>
            <span className="text-xs font-black text-brand-azul">
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
                        className="px-2 py-0.5 rounded border border-gray-200 dark:border-gray-800 text-[10px] font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                      >
                        S/{monto}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => f.onChange(efectivoMonto)}
                      className="px-2 py-0.5 rounded border border-brand-azul/40 text-[10px] font-bold text-brand-azul hover:bg-brand-azul/5"
                    >
                      Exacto
                    </button>
                    <button
                      type="button"
                      onClick={() => f.onChange(0)}
                      className="px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800 text-[10px] font-bold text-rose-500 hover:bg-rose-50"
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
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          agregarOtro()
                        }
                      }}
                      className="h-7 w-24 text-[10px] px-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                    />
                    <button
                      type="button"
                      onClick={agregarOtro}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-800 text-[10px] font-bold text-brand-azul hover:bg-brand-azul/5"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )
            }}
          />

          {vuelto > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-wider">
                Vuelto a Entregar
              </span>
              <span className="text-sm font-black text-green-600 dark:text-green-400">
                {formatCurrency(vuelto)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
