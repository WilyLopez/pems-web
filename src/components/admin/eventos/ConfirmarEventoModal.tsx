'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { useConfirmarEvento } from '@/hooks/useEventos'
import { EventoPrivado } from '@/types/evento.types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

const schema = z
  .object({
    precioTotal: z.coerce
      .number({ invalid_type_error: 'Ingresa un precio válido' })
      .positive('El precio debe ser mayor a 0'),
    montoAdelanto: z.coerce
      .number({ invalid_type_error: 'Ingresa un monto válido' })
      .min(0, 'El adelanto no puede ser negativo'),
    medioPagoAdelanto: z.string().min(1, 'Selecciona el medio de pago'),
  })
  .refine((v) => v.montoAdelanto <= v.precioTotal, {
    message: 'El adelanto no puede superar el precio total',
    path: ['montoAdelanto'],
  })

type FormValues = z.infer<typeof schema>

interface Props {
  evento: EventoPrivado
  open: boolean
  onClose: () => void
}

const MEDIOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'TRANSFERENCIA', label: 'Transferencia bancaria' },
  { value: 'TARJETA', label: 'Tarjeta' },
]

export function ConfirmarEventoModal({ evento, open, onClose }: Props) {
  const confirmar = useConfirmarEvento()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { precioTotal: 0, montoAdelanto: 0, medioPagoAdelanto: '' },
  })

  useEffect(() => {
    if (open) reset({ precioTotal: 0, montoAdelanto: 0, medioPagoAdelanto: '' })
  }, [open, reset])

  const precioTotal   = watch('precioTotal') ?? 0
  const montoAdelanto = watch('montoAdelanto') ?? 0
  const saldo         = Math.max(0, precioTotal - montoAdelanto)

  function onSubmit(values: FormValues) {
    confirmar.mutate(
      {
        id: evento.id,
        payload: {
          precioTotal:       values.precioTotal,
          montoAdelanto:     values.montoAdelanto,
          medioPagoAdelanto: values.medioPagoAdelanto,
        },
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            Confirmar evento
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500">
          {evento.tipoEvento} · {evento.nombreCliente}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="precioTotal" className="text-sm font-semibold">
              Precio total del contrato (S/)
            </Label>
            <Input
              id="precioTotal"
              type="number"
              step="0.01"
              min="0"
              className="h-10 rounded-xl"
              {...register('precioTotal')}
            />
            {errors.precioTotal && (
              <p className="text-xs text-destructive">{errors.precioTotal.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="montoAdelanto" className="text-sm font-semibold">
              Adelanto recibido (S/)
            </Label>
            <Input
              id="montoAdelanto"
              type="number"
              step="0.01"
              min="0"
              className="h-10 rounded-xl"
              {...register('montoAdelanto')}
            />
            {errors.montoAdelanto && (
              <p className="text-xs text-destructive">{errors.montoAdelanto.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Medio de pago del adelanto</Label>
            <Select onValueChange={(v) => setValue('medioPagoAdelanto', v)}>
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                {MEDIOS_PAGO.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.medioPagoAdelanto && (
              <p className="text-xs text-destructive">{errors.medioPagoAdelanto.message}</p>
            )}
          </div>

          {precioTotal > 0 && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Precio total</span>
                <span className="font-semibold">{formatCurrency(precioTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Adelanto</span>
                <span className="font-semibold text-green-700">
                  {formatCurrency(montoAdelanto)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1">
                <span className="font-bold text-gray-900">Saldo pendiente</span>
                <span
                  className={`font-black text-base ${
                    saldo > 0 ? 'text-amber-600' : 'text-green-600'
                  }`}
                >
                  {formatCurrency(saldo)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={onClose}
              disabled={confirmar.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white gap-1.5"
              disabled={confirmar.isPending}
            >
              {confirmar.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar evento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
