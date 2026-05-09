// components/admin/calendario/CalendarioAcciones.tsx

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, CalendarPlus, Loader2 } from 'lucide-react'
import { useBloquearFechas, useCrearFeriado } from '@/hooks/useCalendario'
import { TipoBloqueo } from '@/types/calendario.types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'

const TIPOS_BLOQUEO: { value: TipoBloqueo; label: string }[] = [
  { value: 'MANTENIMIENTO',      label: 'Mantenimiento'      },
  { value: 'LIMPIEZA',           label: 'Limpieza general'   },
  { value: 'EVENTO_CORPORATIVO', label: 'Evento corporativo' },
  { value: 'REMODELACION',       label: 'Remodelacion'       },
  { value: 'CIERRE_ESPECIAL',    label: 'Cierre especial'    },
]

const bloqueoSchema = z.object({
  fechaInicio:  z.string().min(1, 'Selecciona fecha inicio'),
  fechaFin:     z.string().min(1, 'Selecciona fecha fin'),
  tipoBloqueo:  z.string().min(1, 'Selecciona tipo'),
  motivo:       z.string().min(3, 'Describe el motivo').max(300),
})

const feriadoSchema = z.object({
  tipoFeriado:  z.enum(['NACIONAL', 'REGIONAL']),
  fecha:        z.string().min(1, 'Selecciona una fecha'),
  descripcion:  z.string().min(2, 'Describe el feriado').max(120),
})

type BloqueoForm = z.infer<typeof bloqueoSchema>
type FeriadoForm = z.infer<typeof feriadoSchema>

interface CalendarioAccionesProps {
  idSede: number
}

export function CalendarioAcciones({ idSede }: CalendarioAccionesProps) {
  const [modalBloqueo, setModalBloqueo] = useState(false)
  const [modalFeriado, setModalFeriado] = useState(false)

  const bloquear    = useBloquearFechas()
  const crearFeriado = useCrearFeriado()

  const bloqueoForm  = useForm<BloqueoForm>({ resolver: zodResolver(bloqueoSchema) })
  const feriadoForm  = useForm<FeriadoForm>({ resolver: zodResolver(feriadoSchema) })

  const handleBloqueo = bloqueoForm.handleSubmit((v) => {
    bloquear.mutate(
      {
        idSede,
        fechaInicio:  v.fechaInicio,
        fechaFin:     v.fechaFin,
        tipoBloqueo:  v.tipoBloqueo as TipoBloqueo,
        motivo:       v.motivo,
      },
      {
        onSuccess: () => {
          setModalBloqueo(false)
          bloqueoForm.reset()
        },
      },
    )
  })

  const handleFeriado = feriadoForm.handleSubmit((v) => {
    crearFeriado.mutate(v, {
      onSuccess: () => {
        setModalFeriado(false)
        feriadoForm.reset()
      },
    })
  })

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
          onClick={() => setModalBloqueo(true)}
        >
          <Lock className="h-4 w-4" />
          Bloquear fechas
        </Button>
        <Button
          size="sm"
          className="rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setModalFeriado(true)}
        >
          <CalendarPlus className="h-4 w-4" />
          Agregar feriado
        </Button>
      </div>

      <Dialog open={modalBloqueo} onOpenChange={setModalBloqueo}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Bloquear fechas
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBloqueo} className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha inicio</Label>
                <Input type="date" className="h-10 rounded-xl" {...bloqueoForm.register('fechaInicio')} />
                {bloqueoForm.formState.errors.fechaInicio && (
                  <p className="text-xs text-destructive">{bloqueoForm.formState.errors.fechaInicio.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Fecha fin</Label>
                <Input type="date" className="h-10 rounded-xl" {...bloqueoForm.register('fechaFin')} />
                {bloqueoForm.formState.errors.fechaFin && (
                  <p className="text-xs text-destructive">{bloqueoForm.formState.errors.fechaFin.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de bloqueo</Label>
              <Select onValueChange={(v) => bloqueoForm.setValue('tipoBloqueo', v)}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_BLOQUEO.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bloqueoForm.formState.errors.tipoBloqueo && (
                <p className="text-xs text-destructive">{bloqueoForm.formState.errors.tipoBloqueo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea
                rows={3}
                placeholder="Describe el motivo del bloqueo..."
                className="rounded-xl"
                {...bloqueoForm.register('motivo')}
              />
              {bloqueoForm.formState.errors.motivo && (
                <p className="text-xs text-destructive">{bloqueoForm.formState.errors.motivo.message}</p>
              )}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalBloqueo(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1.5"
              onClick={handleBloqueo}
              disabled={bloquear.isPending}
            >
              {bloquear.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear bloqueo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={modalFeriado} onOpenChange={setModalFeriado}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-purple-600" />
              Registrar feriado
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFeriado} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de feriado</Label>
              <Select onValueChange={(v) => feriadoForm.setValue('tipoFeriado', v as 'NACIONAL' | 'REGIONAL')}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NACIONAL">Nacional</SelectItem>
                  <SelectItem value="REGIONAL">Regional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Input type="date" className="h-10 rounded-xl" {...feriadoForm.register('fecha')} />
            </div>
            <div className="space-y-2">
              <Label>Descripcion</Label>
              <Input
                placeholder="Ej: Dia del Trabajo"
                className="h-10 rounded-xl"
                {...feriadoForm.register('descripcion')}
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalFeriado(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-1.5"
              onClick={handleFeriado}
              disabled={crearFeriado.isPending}
            >
              {crearFeriado.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}