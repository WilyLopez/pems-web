'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { cerrarCajaSchema, useCajaMutations } from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

type FormValues = z.infer<typeof cerrarCajaSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  idApertura: number
}

export function CerrarCajaModal({ open, onOpenChange, idApertura }: Props) {
  const { cerrar } = useCajaMutations()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(cerrarCajaSchema),
    defaultValues: { saldoFinal: 0 },
  })

  function onSubmit(v: FormValues) {
    cerrar.mutate(
      { idApertura, payload: v },
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
          <DialogTitle>Cerrar caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Saldo final (S/)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('saldoFinal')}
            />
            {errors.saldoFinal && (
              <p className="text-xs text-red-500">
                {errors.saldoFinal.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Observaciones</Label>
            <Input {...register('observaciones')} placeholder="Opcional…" />
          </div>
          <div className="flex justify-end gap-2">
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
              disabled={cerrar.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Cerrar caja
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
