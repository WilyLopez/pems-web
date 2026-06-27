'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { movimientoCajaSchema, useCajaMutations } from '@/features/admin/finance'
import { MEDIOS_PAGO } from '@/lib/finance-constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select'

type FormValues = z.infer<typeof movimientoCajaSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  idApertura: number
}

export function RegistrarMovimientoModal({ open, onOpenChange, idApertura }: Props) {
  const { registrarMovimiento } = useCajaMutations()
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(movimientoCajaSchema),
  })

  function onSubmit(v: FormValues) {
    registrarMovimiento.mutate(
      { idApertura, payload: v },
      { onSuccess: () => { reset(); onOpenChange(false) } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select
              value={watch('tipo') || ''}
              onValueChange={(v) => setValue('tipo', v as 'INGRESO' | 'EGRESO')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESO">Ingreso</SelectItem>
                <SelectItem value="EGRESO">Egreso</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo && <p className="text-xs text-red-500">{errors.tipo.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Concepto</Label>
            <Input {...register('concepto')} placeholder="Descripción del movimiento" />
            {errors.concepto && <p className="text-xs text-red-500">{errors.concepto.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Monto (S/)</Label>
              <Input type="number" step="0.01" min="0" {...register('monto')} />
              {errors.monto && <p className="text-xs text-red-500">{errors.monto.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Medio de pago</Label>
              <Select
                value={watch('medioPago') || '__none__'}
                onValueChange={(v) => setValue('medioPago', v === '__none__' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">—</SelectItem>
                  {MEDIOS_PAGO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={registrarMovimiento.isPending}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              Registrar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
