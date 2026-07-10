'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTiposEgreso, useEgresoMutations, useMiSesionCaja } from '../hooks/useFinanceData'
import { egresoSchema } from '../schemas/finance.schemas'
import { CajaRequeridaAlert } from './CajaRequeridaAlert'
import { MEDIOS_PAGO } from '@/lib/finance-constants'

type FormValues = z.infer<typeof egresoSchema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  idSede: number
}

export function RegistrarEgresoModal({ open, onOpenChange, idSede }: Props) {
  const { data: tipos = [] } = useTiposEgreso()
  const { registrar } = useEgresoMutations()
  const { data: miSesionCaja, isLoading: cargandoSesionCaja } =
    useMiSesionCaja()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(egresoSchema) as any,
    defaultValues: {
      tipoEgresoCodigo: '',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
      medioPago: '',
      esRecurrente: false,
      descripcion: '',
      comprobanteUrl: '',
    },
  })

  const esRecurrente = watch('esRecurrente')
  const medioPagoSeleccionado = watch('medioPago')
  const requiereCajaAdministrativa =
    medioPagoSeleccionado === 'EFECTIVO' &&
    !cargandoSesionCaja &&
    miSesionCaja?.tipo !== 'ADMINISTRATIVA'

  useEffect(() => {
    if (open) {
      reset({
        tipoEgresoCodigo: '',
        monto: 0,
        fecha: new Date().toISOString().split('T')[0],
        medioPago: '',
        esRecurrente: false,
        descripcion: '',
        comprobanteUrl: '',
      })
    }
  }, [open, reset])

  function onSubmit(data: FormValues) {
    if (requiereCajaAdministrativa) return
    const payload = {
      tipoEgresoCodigo: data.tipoEgresoCodigo,
      monto: data.monto,
      fecha: data.fecha,
      medioPago: data.medioPago,
      esRecurrente: data.esRecurrente,
      periodoAnio: data.esRecurrente ? data.periodoAnio : undefined,
      periodoMes: data.esRecurrente ? data.periodoMes : undefined,
      descripcion: data.descripcion || undefined,
      comprobanteUrl: data.comprobanteUrl || undefined,
    }
    registrar.mutate(
      { idSede, payload },
      { onSuccess: () => onOpenChange(false) }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar egreso</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Tipo de egreso *</Label>
            <Select onValueChange={(v) => setValue('tipoEgresoCodigo', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {tipos
                  .filter((t) => t.activo)
                  .map((t) => (
                    <SelectItem key={t.codigo} value={t.codigo}>
                      {t.nombre}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.tipoEgresoCodigo && (
              <p className="text-xs text-destructive">
                {errors.tipoEgresoCodigo.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="monto">Monto *</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                min="0"
                {...register('monto')}
              />
              {errors.monto && (
                <p className="text-xs text-destructive">
                  {errors.monto.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input id="fecha" type="date" {...register('fecha')} />
              {errors.fecha && (
                <p className="text-xs text-destructive">
                  {errors.fecha.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Medio de pago *</Label>
            <select
              {...register('medioPago')}
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul"
            >
              <option value="">Seleccionar…</option>
              {MEDIOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.medioPago && (
              <p className="text-xs text-destructive">
                {errors.medioPago.message}
              </p>
            )}
          </div>

          {requiereCajaAdministrativa && (
            <CajaRequeridaAlert mensaje="Para registrar egresos en efectivo necesitas tu Caja Administrativa abierta." />
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="esRecurrente"
              checked={esRecurrente}
              onCheckedChange={(v) => setValue('esRecurrente', Boolean(v))}
            />
            <Label
              htmlFor="esRecurrente"
              className="cursor-pointer font-normal"
            >
              Es egreso recurrente (asignar periodo)
            </Label>
          </div>

          {esRecurrente && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="periodoAnio">Año</Label>
                <Input
                  id="periodoAnio"
                  type="number"
                  min="2020"
                  max="2099"
                  {...register('periodoAnio')}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="periodoMes">Mes (1-12)</Label>
                <Input
                  id="periodoMes"
                  type="number"
                  min="1"
                  max="12"
                  {...register('periodoMes')}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripcion</Label>
            <Input
              id="descripcion"
              placeholder="Descripcion opcional..."
              {...register('descripcion')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comprobanteUrl">URL comprobante</Label>
            <Input
              id="comprobanteUrl"
              placeholder="https://..."
              {...register('comprobanteUrl')}
            />
            {errors.comprobanteUrl && (
              <p className="text-xs text-destructive">
                {errors.comprobanteUrl.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={registrar.isPending || requiereCajaAdministrativa}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {registrar.isPending ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
