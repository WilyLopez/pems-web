'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { abrirCajaSchema, useCajaMutations } from '@/features/admin/finance'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

type FormValues = z.infer<typeof abrirCajaSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  idSede: number
  fecha: string
}

export function AbrirCajaModal({ open, onOpenChange, idSede, fecha }: Props) {
  const { abrir } = useCajaMutations()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: { saldoInicial: 0 },
  })

  function onSubmit(v: FormValues) {
    abrir.mutate(
      { idSede, payload: { ...v, fecha } },
      { onSuccess: () => { reset(); onOpenChange(false) } },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Saldo inicial (S/)</Label>
            <Input type="number" step="0.01" min="0" {...register('saldoInicial')} />
            {errors.saldoInicial && (
              <p className="text-xs text-red-500">{errors.saldoInicial.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Observaciones</Label>
            <Input {...register('observaciones')} placeholder="Opcional…" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={abrir.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Abrir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
