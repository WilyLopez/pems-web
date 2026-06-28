'use client'

import { useMemo } from 'react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn, formatCurrency } from '@/lib/utils'

export interface PlanCuotasValue {
  numeroCuotas: number
  fechaLimitePago: string
}

interface CuotaPreview {
  numero: number
  monto: number
  fechaVencimiento: string
  esAdelanto: boolean
}

interface Props {
  precioTotal: number
  montoAdelanto: number
  value: PlanCuotasValue
  onChange: (v: PlanCuotasValue) => void
  disabled?: boolean
  fechaMaxima?: string
}

function generarPreview(
  precioTotal: number,
  montoAdelanto: number,
  numeroCuotas: number,
  fechaLimitePago: string
): CuotaPreview[] {
  if (!precioTotal || numeroCuotas < 2 || !fechaLimitePago) return []

  const hoy = new Date()
  const limite = new Date(fechaLimitePago)
  if (limite <= hoy) return []

  const restante = precioTotal - montoAdelanto
  const cuotasRestantes = numeroCuotas - 1
  const diasTotal = Math.floor((limite.getTime() - hoy.getTime()) / 86_400_000)

  const montoPorCuota = Math.floor((restante / cuotasRestantes) * 100) / 100
  const montoUltima =
    Math.round((restante - montoPorCuota * (cuotasRestantes - 1)) * 100) / 100

  const cuotas: CuotaPreview[] = [
    {
      numero: 1,
      monto: montoAdelanto,
      fechaVencimiento: hoy.toISOString().split('T')[0],
      esAdelanto: true,
    },
  ]

  for (let i = 2; i <= numeroCuotas; i++) {
    const diasOffset =
      cuotasRestantes === 1
        ? diasTotal
        : Math.round((diasTotal * (i - 1)) / cuotasRestantes)
    const fecha = new Date(hoy)
    fecha.setDate(fecha.getDate() + diasOffset)

    cuotas.push({
      numero: i,
      monto: i === numeroCuotas ? montoUltima : montoPorCuota,
      fechaVencimiento: fecha.toISOString().split('T')[0],
      esAdelanto: false,
    })
  }

  return cuotas
}

function formatFecha(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function PlanCuotasBuilder({
  precioTotal,
  montoAdelanto,
  value,
  onChange,
  disabled,
  fechaMaxima,
}: Props) {
  const preview = useMemo(
    () =>
      generarPreview(
        precioTotal,
        montoAdelanto,
        value.numeroCuotas,
        value.fechaLimitePago
      ),
    [precioTotal, montoAdelanto, value.numeroCuotas, value.fechaLimitePago]
  )

  const hoyIso = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Número de cuotas
          </Label>
          <Select
            value={String(value.numeroCuotas)}
            onValueChange={(v) =>
              onChange({ ...value, numeroCuotas: parseInt(v) })
            }
            disabled={disabled}
          >
            <SelectTrigger className="h-10 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 3 }, (_, i) => i + 2).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} cuotas
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700">
            Completar pago antes del
          </Label>
          <Input
            type="date"
            min={hoyIso}
            max={fechaMaxima}
            value={value.fechaLimitePago}
            onChange={(e) =>
              onChange({ ...value, fechaLimitePago: e.target.value })
            }
            disabled={disabled}
            className="h-10 rounded-xl text-sm"
          />
        </div>
      </div>

      {preview.length > 0 && (
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
            Cronograma de pagos
          </div>
          <div className="divide-y divide-gray-50">
            {preview.map((c) => (
              <div
                key={c.numero}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm',
                  c.esAdelanto && 'bg-green-50/60'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0',
                      c.esAdelanto
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {c.numero}
                  </span>
                  <span className="text-xs text-gray-500">
                    {c.esAdelanto
                      ? 'Adelanto — hoy'
                      : formatFecha(c.fechaVencimiento)}
                  </span>
                </div>
                <span
                  className={cn(
                    'font-semibold text-sm',
                    c.esAdelanto ? 'text-green-700' : 'text-gray-900'
                  )}
                >
                  {formatCurrency(c.monto)}
                </span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 bg-gray-50 flex justify-between text-xs font-bold text-gray-600 border-t border-gray-100">
            <span>Total</span>
            <span>{formatCurrency(precioTotal)}</span>
          </div>
        </div>
      )}

      {value.fechaLimitePago &&
        new Date(value.fechaLimitePago) <= new Date() && (
          <p className="text-xs text-destructive">
            La fecha límite de pago debe ser posterior a hoy.
          </p>
        )}
      {value.fechaLimitePago &&
        fechaMaxima &&
        new Date(value.fechaLimitePago) > new Date(fechaMaxima) && (
          <p className="text-xs text-destructive">
            La fecha límite no puede ser posterior al día del evento (
            {formatFecha(fechaMaxima)}).
          </p>
        )}
    </div>
  )
}
