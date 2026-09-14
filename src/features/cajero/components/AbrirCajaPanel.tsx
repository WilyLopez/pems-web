'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { abrirCajaSchema, useCajaMutations } from '@/features/admin/finanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Unlock } from 'lucide-react'

type FormValues = z.infer<typeof abrirCajaSchema>

interface Props {
  idSede: number
  onSuccess?: () => void
}

export function AbrirCajaPanel({ idSede, onSuccess }: Props) {
  const { abrir } = useCajaMutations()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: { saldoInicial: 0 },
  })

  function onSubmit(v: FormValues) {
    abrir.mutate(
      { idSede, payload: v },
      {
        onSuccess: () => {
          reset()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-sm mx-auto text-center space-y-5">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center">
          <Unlock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Abrir caja
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Registra el saldo inicial para comenzar el día
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-left">
        <div className="space-y-1">
          <Label>Saldo inicial (S/)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('saldoInicial')}
          />
          {errors.saldoInicial && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.saldoInicial.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Observaciones</Label>
          <Input {...register('observaciones')} placeholder="Opcional…" />
        </div>
        <Button
          type="submit"
          disabled={abrir.isPending}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {abrir.isPending ? 'Abriendo…' : 'Abrir caja'}
        </Button>
      </form>
    </div>
  )
}
