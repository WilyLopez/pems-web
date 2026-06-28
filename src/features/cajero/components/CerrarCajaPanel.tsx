'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  cerrarCajaSchema,
  useCajaMutations,
  AperturaCaja,
} from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Lock, ClipboardCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type FormValues = z.infer<typeof cerrarCajaSchema>

interface Props {
  caja: AperturaCaja
  onArqueo: () => void
}

export function CerrarCajaPanel({ caja, onArqueo }: Props) {
  const { cerrar } = useCajaMutations()

  const saldoEsperado =
    caja.saldoEsperado ??
    caja.saldoInicial + caja.totalIngresos - caja.totalEgresos

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(cerrarCajaSchema),
    defaultValues: { saldoFinal: 0 },
  })

  const saldoFinalWatch = useWatch({ control, name: 'saldoFinal' })
  const saldoFinalNum = Number(saldoFinalWatch) || 0
  const diferencia = saldoFinalNum - saldoEsperado
  const hayDiferencia = saldoFinalNum > 0

  function onSubmit(v: FormValues) {
    cerrar.mutate(
      { idApertura: caja.id, payload: v },
      { onSuccess: () => reset() }
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
          <Lock className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Cierre de caja</h3>
          <p className="text-xs text-gray-400">
            Cuadre el efectivo antes de cerrar
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Saldo inicial</span>
          <span className="font-semibold">
            {formatCurrency(caja.saldoInicial)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">+ Ingresos</span>
          <span className="font-semibold text-emerald-600">
            +{formatCurrency(caja.totalIngresos)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">- Egresos</span>
          <span className="font-semibold text-red-500">
            -{formatCurrency(caja.totalEgresos)}
          </span>
        </div>
        <div className="flex justify-between border-t pt-2 mt-1">
          <span className="font-bold text-gray-700">Saldo esperado</span>
          <span className="font-black text-gray-900">
            {formatCurrency(saldoEsperado)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1">
          <Label>Saldo contado (S/)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('saldoFinal')}
          />
          {errors.saldoFinal && (
            <p className="text-xs text-red-500">{errors.saldoFinal.message}</p>
          )}
        </div>

        {hayDiferencia && (
          <div
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold',
              diferencia >= 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            )}
          >
            <span>Diferencia</span>
            <span>
              {diferencia >= 0 ? '+' : ''}
              {formatCurrency(diferencia)}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <Label>Observaciones</Label>
          <Input {...register('observaciones')} placeholder="Opcional…" />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={onArqueo}
          >
            <ClipboardCheck className="h-4 w-4" />
            Arqueo parcial
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={cerrar.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-1.5"
          >
            <Lock className="h-4 w-4" />
            {cerrar.isPending ? 'Cerrando…' : 'Cerrar caja'}
          </Button>
        </div>
      </form>
    </div>
  )
}
