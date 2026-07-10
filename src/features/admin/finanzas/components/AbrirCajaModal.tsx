'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { abrirCajaSchema, useCajaMutations } from '@/features/admin/finanzas'
import { useDisponibilidad } from '@/features/admin/calendario/hooks/useCalendarData'
import { fechaHoyEnZonaNegocio } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
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
}

export function AbrirCajaModal({ open, onOpenChange, idSede }: Props) {
  const { abrir } = useCajaMutations()
  const { data: disponibilidadHoy } = useDisponibilidad(
    idSede,
    fechaHoyEnZonaNegocio()
  )
  const hayEventoHoy =
    disponibilidadHoy?.tipoOcupacion === 'PRIVADO_PARCIAL' ||
    disponibilidadHoy?.tipoOcupacion === 'PRIVADO_LLENO'
  const [confirmandoEvento, setConfirmandoEvento] = useState(false)
  const [valoresPendientes, setValoresPendientes] = useState<FormValues | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(abrirCajaSchema),
    defaultValues: { saldoInicial: 0 },
  })

  function confirmarApertura(v: FormValues) {
    abrir.mutate(
      { idSede, payload: v },
      {
        onSuccess: () => {
          reset()
          setConfirmandoEvento(false)
          setValoresPendientes(null)
          onOpenChange(false)
        },
      }
    )
  }

  function onSubmit(v: FormValues) {
    if (hayEventoHoy) {
      setValoresPendientes(v)
      setConfirmandoEvento(true)
      return
    }
    confirmarApertura(v)
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
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('saldoInicial')}
            />
            {errors.saldoInicial && (
              <p className="text-xs text-red-500">
                {errors.saldoInicial.message}
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
              disabled={abrir.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Abrir
            </Button>
          </div>
        </form>
      </DialogContent>

      <ConfirmDialog
        open={confirmandoEvento}
        onOpenChange={(o) => {
          setConfirmandoEvento(o)
          if (!o) setValoresPendientes(null)
        }}
        title="¿Estás seguro que quieres abrir caja?"
        description="Hay un evento privado programado para hoy en esta sede."
        confirmLabel="Sí, abrir caja"
        destructive={false}
        onConfirm={() => {
          if (valoresPendientes) confirmarApertura(valoresPendientes)
        }}
      />
    </Dialog>
  )
}
