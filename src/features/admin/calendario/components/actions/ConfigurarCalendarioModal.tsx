'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Settings, Loader2 } from 'lucide-react'

import { useConfiguracionCalendario, useActualizarConfiguracion } from '../../hooks/useCalendarData'
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

const configSchema = z.object({
  aforoMaximo: z.number().min(1).max(500),
  diasMinReservaPublica: z.number().min(0),
  diasMaxReservaPublica: z.number().min(1),
  diasMinEventoPrivado: z.number().min(0),
  diasMaxEventoPrivado: z.number().min(1),
  horaApertura: z.string().min(5),
  horaCierre: z.string().min(5),
  diasOperacion: z.string(),
})

type ConfigForm = z.infer<typeof configSchema>

interface ConfigurarCalendarioModalProps {
  idSede: number
  open: boolean
  onClose: () => void
}

export const ConfigurarCalendarioModal = React.memo(({
  idSede,
  open,
  onClose,
}: ConfigurarCalendarioModalProps) => {
  const { data: config, isLoading } = useConfiguracionCalendario(idSede)
  const actualizar = useActualizarConfiguracion(idSede)

  const form = useForm<ConfigForm>({
    resolver: zodResolver(configSchema),
    values: config ? {
      aforoMaximo: config.aforoMaximo,
      diasMinReservaPublica: config.diasMinReservaPublica,
      diasMaxReservaPublica: config.diasMaxReservaPublica,
      diasMinEventoPrivado: config.diasMinEventoPrivado,
      diasMaxEventoPrivado: config.diasMaxEventoPrivado,
      horaApertura: config.horaApertura,
      horaCierre: config.horaCierre,
      diasOperacion: config.diasOperacion,
    } : undefined,
  })

  const onSubmit = (values: ConfigForm) => {
    actualizar.mutate(values, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500" />
            Configurar Calendario
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-azul" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Aforo Máximo</Label>
                <Input type="number" {...form.register('aforoMaximo', { valueAsNumber: true })} />
              </div>
              
              <div className="space-y-2">
                <Label>Reserva Mín. (días)</Label>
                <Input type="number" {...form.register('diasMinReservaPublica', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Reserva Máx. (días)</Label>
                <Input type="number" {...form.register('diasMaxReservaPublica', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <Label>Evento Mín. (días)</Label>
                <Input type="number" {...form.register('diasMinEventoPrivado', { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>Evento Máx. (días)</Label>
                <Input type="number" {...form.register('diasMaxEventoPrivado', { valueAsNumber: true })} />
              </div>

              <div className="space-y-2">
                <Label>Hora Apertura</Label>
                <Input type="time" {...form.register('horaApertura')} />
              </div>
              <div className="space-y-2">
                <Label>Hora Cierre</Label>
                <Input type="time" {...form.register('horaCierre')} />
              </div>
            </div>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            className="bg-brand-azul hover:bg-brand-azul/90 text-white rounded-xl"
            disabled={actualizar.isPending}
          >
            {actualizar.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

ConfigurarCalendarioModal.displayName = 'ConfigurarCalendarioModal'
