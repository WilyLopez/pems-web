'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  arqueoSchema,
  useArqueoMutations,
  AperturaCaja,
} from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

type FormValues = z.infer<typeof arqueoSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  caja: AperturaCaja
}

export function RegistrarArqueoModal({ open, onOpenChange, caja }: Props) {
  const { registrar } = useArqueoMutations()

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
    resolver: zodResolver(arqueoSchema),
    defaultValues: { saldoContado: 0 },
  })

  const saldoContadoWatch = useWatch({ control, name: 'saldoContado' })
  const saldoContadoNum = Number(saldoContadoWatch) || 0
  const diferencia = saldoContadoNum - saldoEsperado
  const hayValor = saldoContadoNum > 0

  function onSubmit(v: FormValues) {
    registrar.mutate(
      { idApertura: caja.id, payload: v },
      {
        onSuccess: () => {
          reset()
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Arqueo de caja</DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 rounded-xl p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Saldo esperado</span>
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
              {...register('saldoContado')}
            />
            {errors.saldoContado && (
              <p className="text-xs text-red-500">
                {errors.saldoContado.message}
              </p>
            )}
          </div>

          {hayValor && (
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

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={registrar.isPending}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {registrar.isPending ? 'Guardando…' : 'Registrar arqueo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
