'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { cn, formatCurrency } from '@/lib/utils'
import { PagoItem } from '../../types'

const MEDIOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'TARJETA', label: 'Tarjeta' },
]

interface Props {
  value: PagoItem[]
  onChange: (items: PagoItem[]) => void
  totalEsperado?: number
  disabled?: boolean
}

export function MultiMedioPago({
  value,
  onChange,
  totalEsperado,
  disabled,
}: Props) {
  const total = value.reduce((sum, p) => sum + (p.monto || 0), 0)
  const coincide =
    totalEsperado === undefined || Math.abs(total - totalEsperado) < 0.01

  function agregar() {
    onChange([...value, { medioPago: '', monto: 0 }])
  }

  function quitar(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  function cambiarMedio(idx: number, medioPago: string) {
    onChange(value.map((p, i) => (i === idx ? { ...p, medioPago } : p)))
  }

  function cambiarMonto(idx: number, raw: string) {
    const monto = parseFloat(raw) || 0
    onChange(value.map((p, i) => (i === idx ? { ...p, monto } : p)))
  }

  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <Select
            value={item.medioPago}
            onValueChange={(v) => cambiarMedio(idx, v)}
            disabled={disabled}
          >
            <SelectTrigger className="h-10 rounded-xl flex-1 min-w-0">
              <SelectValue placeholder="Medio de pago" />
            </SelectTrigger>
            <SelectContent>
              {MEDIOS_PAGO.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-36 shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
              S/
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={item.monto || ''}
              onChange={(e) => cambiarMonto(idx, e.target.value)}
              disabled={disabled}
              className="h-10 rounded-xl pl-8"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || value.length <= 1}
            onClick={() => quitar(idx)}
            className="h-10 w-10 rounded-xl text-gray-400 hover:text-destructive shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || value.length >= 4}
          onClick={agregar}
          className="rounded-xl gap-1.5 text-brand-azul hover:text-brand-azul hover:bg-brand-azul/5 px-3"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar medio
        </Button>

        {totalEsperado !== undefined && value.length > 0 && (
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-lg',
              coincide
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            )}
          >
            Total: {formatCurrency(total)}
            {!coincide && ` · esperado ${formatCurrency(totalEsperado)}`}
          </span>
        )}
      </div>
    </div>
  )
}
