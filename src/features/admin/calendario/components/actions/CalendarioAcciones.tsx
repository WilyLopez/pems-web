'use client'

import React from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Lock,
  CalendarPlus,
  Loader2,
  Settings,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useBloquearFechas,
  useCrearFeriado,
  useDisponibilidadRango,
  useConfiguracionCalendario,
} from '../../hooks/useCalendarData'
import { TipoBloqueo } from '../../types'
import { ConfigurarCalendarioModal } from '../actions/ConfigurarCalendarioModal'
import { ProgramacionSemanalModal } from '../actions/ProgramacionSemanalModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'
import { useCalendarNav } from '../../hooks/useCalendarNav'

const TIPOS_BLOQUEO: { value: TipoBloqueo; label: string }[] = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'LIMPIEZA', label: 'Limpieza general' },
  { value: 'EVENTO_CORPORATIVO', label: 'Evento corporativo' },
  { value: 'REMODELACION', label: 'Remodelacion' },
  { value: 'CIERRE_ESPECIAL', label: 'Cierre especial' },
]

const hoy = format(new Date(), 'yyyy-MM-dd')

const bloqueoSchema = z
  .object({
    fechaInicio: z
      .string()
      .min(1, 'Selecciona fecha inicio')
      .refine((v) => !v || v >= hoy, {
        message: 'No se pueden bloquear fechas pasadas',
      }),
    fechaFin: z.string().min(1, 'Selecciona fecha fin'),
    tipoBloqueo: z.string().min(1, 'Selecciona tipo'),
    motivo: z.string().min(3, 'Describe el motivo').max(300),
    esEmergencia: z.boolean().default(false),
  })
  .refine((v) => !v.fechaInicio || !v.fechaFin || v.fechaFin >= v.fechaInicio, {
    message: 'La fecha fin debe ser igual o posterior a la fecha inicio',
    path: ['fechaFin'],
  })

const feriadoSchema = z.object({
  tipoFeriado: z.enum(['NACIONAL', 'REGIONAL']),
  fecha: z
    .string()
    .min(1, 'Selecciona una fecha')
    .refine((v) => !v || v >= hoy, {
      message: 'No se pueden registrar feriados en fechas pasadas',
    }),
  descripcion: z.string().min(2, 'Describe el feriado').max(120),
})

type BloqueoForm = z.infer<typeof bloqueoSchema>
type FeriadoForm = z.infer<typeof feriadoSchema>

interface CalendarioAccionesProps {
  idSede: number
}

export const CalendarioAcciones = React.memo(
  ({ idSede }: CalendarioAccionesProps) => {
    const { modal, openModal } = useCalendarNav()

    const bloquear = useBloquearFechas()
    const crearFeriado = useCrearFeriado()
    const { data: configCal } = useConfiguracionCalendario(idSede)
    const rangoMaxBloqueo = configCal?.rangoMaxBloqueo ?? 90

    const bloqueoForm = useForm<BloqueoForm>({
      resolver: zodResolver(bloqueoSchema),
      mode: 'onChange',
    })
    const feriadoForm = useForm<FeriadoForm>({
      resolver: zodResolver(feriadoSchema),
      mode: 'onChange',
    })

    const inicioBloqueo = bloqueoForm.watch('fechaInicio')
    const finBloqueo = bloqueoForm.watch('fechaFin')
    const esEmergencia = bloqueoForm.watch('esEmergencia')

    const { data: dispBloqueo } = useDisponibilidadRango(
      idSede,
      inicioBloqueo,
      finBloqueo || inicioBloqueo
    )
    const fechaFeriado = feriadoForm.watch('fecha')
    const { data: dispFeriado } = useDisponibilidadRango(
      idSede,
      fechaFeriado,
      fechaFeriado
    )

    const conflictosBloqueo =
      dispBloqueo?.filter((d) => d.totalReservas > 0 || d.totalEventos > 0) ??
      []
    const tieneAtencionBloqueo = dispBloqueo?.some(
      (d) => d.aforoPublicoActual > 0 && d.fecha === hoy
    )
    const tieneProgramacionBloqueo = dispBloqueo?.some(
      (d) => d.tieneProgramacionSemanal
    )
    const rangoExcedido =
      !!inicioBloqueo &&
      !!finBloqueo &&
      differenceInDays(parseISO(finBloqueo), parseISO(inicioBloqueo)) + 1 >
        rangoMaxBloqueo

    const conflictoFeriado = dispFeriado?.[0]
    const tieneActividadFeriado =
      (conflictoFeriado?.totalReservas ?? 0) > 0 ||
      (conflictoFeriado?.totalEventos ?? 0) > 0
    const tieneAtencionFeriado =
      (conflictoFeriado?.aforoPublicoActual ?? 0) > 0 &&
      conflictoFeriado?.fecha === hoy

    const submitBloqueo = (values: BloqueoForm) => {
      if (tieneAtencionBloqueo) {
        toast.error(
          'No se puede bloquear un rango que incluya el dia de hoy con atencion activa.'
        )
        return
      }
      if (tieneProgramacionBloqueo && !values.esEmergencia) {
        toast.error(
          'Este rango incluye fechas con programacion semanal activa. Usa el modo de emergencia.'
        )
        return
      }
      bloquear.mutate(
        {
          idSede,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin,
          tipoBloqueo: values.tipoBloqueo as TipoBloqueo,
          motivo: values.motivo,
          confirmado: false,
        },
        {
          onSuccess: () => {
            openModal(null)
            bloqueoForm.reset()
          },
        }
      )
    }

    const handleBloqueo = bloqueoForm.handleSubmit((v) => submitBloqueo(v))

    const handleFeriado = feriadoForm.handleSubmit((v) => {
      crearFeriado.mutate(v, {
        onSuccess: () => {
          openModal(null)
          feriadoForm.reset()
        },
      })
    })

    return (
      <>
        {/* Barra de acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 h-9 px-3.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800 font-semibold"
            onClick={() => openModal('config')}
          >
            <Settings className="h-3.5 w-3.5" />
            Configurar
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 h-9 px-3.5 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold"
            onClick={() => openModal('programacion')}
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Programacion semanal
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 h-9 px-3.5 border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
            onClick={() => openModal('bloqueo')}
          >
            <Lock className="h-3.5 w-3.5" />
            Bloquear fechas
          </Button>

          <Button
            variant="purple"
            size="sm"
            className="rounded-xl gap-1.5 h-9 px-3.5 font-semibold"
            onClick={() => openModal('feriado')}
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Agregar feriado
          </Button>
        </div>

        <ConfigurarCalendarioModal
          idSede={idSede}
          open={modal === 'config'}
          onClose={() => openModal(null)}
        />

        <ProgramacionSemanalModal
          idSede={idSede}
          open={modal === 'programacion'}
          onClose={() => openModal(null)}
        />

        {/* Modal: Bloquear fechas */}
        <Dialog
          open={modal === 'bloqueo'}
          onOpenChange={(v) => !v && openModal(null)}
        >
          <DialogContent className="sm:max-w-md rounded-2xl z-[100] p-0 overflow-hidden border border-gray-100 shadow-xl">
            <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-gray-900 leading-none">
                    Bloquear fechas
                  </DialogTitle>
                  <p className="text-xs text-gray-400 mt-1">
                    Cierra el acceso publico en el rango seleccionado
                  </p>
                </div>
              </div>
            </DialogHeader>

            <form
              onSubmit={handleBloqueo}
              className="px-6 py-5 space-y-4 bg-gray-50/40"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">
                    Fecha inicio
                  </Label>
                  <Input
                    type="date"
                    min={hoy}
                    className="h-10 rounded-xl bg-white"
                    {...bloqueoForm.register('fechaInicio')}
                  />
                  {bloqueoForm.formState.errors.fechaInicio && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {bloqueoForm.formState.errors.fechaInicio.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-600">
                    Fecha fin
                  </Label>
                  <Input
                    type="date"
                    min={inicioBloqueo || hoy}
                    className="h-10 rounded-xl bg-white"
                    {...bloqueoForm.register('fechaFin')}
                  />
                  {bloqueoForm.formState.errors.fechaFin && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      {bloqueoForm.formState.errors.fechaFin.message}
                    </p>
                  )}
                </div>
              </div>

              {tieneAtencionBloqueo && (
                <div className="bg-white border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-medium">
                    No se puede bloquear hoy con atencion activa en el local.
                  </p>
                </div>
              )}

              {tieneProgramacionBloqueo && (
                <div className="flex items-center gap-3 bg-white border border-red-100 rounded-xl p-3">
                  <Checkbox
                    id="esEmergencia"
                    checked={esEmergencia}
                    onCheckedChange={(checked) =>
                      bloqueoForm.setValue('esEmergencia', !!checked)
                    }
                  />
                  <div>
                    <label
                      htmlFor="esEmergencia"
                      className="text-xs font-bold text-red-900 cursor-pointer"
                    >
                      Caso de emergencia
                    </label>
                    <p className="text-[11px] text-red-600 mt-0.5">
                      Permite bloquear fechas con programacion semanal activa.
                    </p>
                  </div>
                </div>
              )}

              {rangoExcedido && (
                <div className="bg-white border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-medium">
                    El rango no puede exceder {rangoMaxBloqueo} dias.
                  </p>
                </div>
              )}

              {conflictosBloqueo.length > 0 && !tieneAtencionBloqueo && (
                <div className="bg-white border border-red-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-xs font-bold text-red-800">
                      No se puede bloquear: dias con actividad
                    </p>
                  </div>
                  <ul className="text-[11px] text-red-700 space-y-0.5 ml-6 list-disc">
                    {conflictosBloqueo.slice(0, 3).map((c) => (
                      <li key={c.fecha}>
                        {format(parseISO(c.fecha), 'd MMM', { locale: es })}:{' '}
                        {c.totalReservas} reservas, {c.totalEventos} eventos
                      </li>
                    ))}
                    {conflictosBloqueo.length > 3 && (
                      <li>Y {conflictosBloqueo.length - 3} dias mas...</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600">
                  Tipo de bloqueo
                </Label>
                <Select
                  onValueChange={(v) => bloqueoForm.setValue('tipoBloqueo', v)}
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_BLOQUEO.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {bloqueoForm.formState.errors.tipoBloqueo && (
                  <p className="text-xs text-destructive">
                    {bloqueoForm.formState.errors.tipoBloqueo.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600">
                  Motivo
                </Label>
                <Textarea
                  rows={3}
                  placeholder="Describe el motivo del bloqueo..."
                  className="rounded-xl bg-white resize-none"
                  {...bloqueoForm.register('motivo')}
                />
                {bloqueoForm.formState.errors.motivo && (
                  <p className="text-xs text-destructive">
                    {bloqueoForm.formState.errors.motivo.message}
                  </p>
                )}
              </div>
            </form>

            <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 gap-2">
              <Button
                variant="ghost"
                onClick={() => openModal(null)}
                className="rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                variant="red"
                onClick={handleBloqueo}
                disabled={
                  bloquear.isPending ||
                  tieneAtencionBloqueo ||
                  (tieneProgramacionBloqueo && !esEmergencia) ||
                  conflictosBloqueo.length > 0 ||
                  rangoExcedido
                }
                className="rounded-xl gap-1.5 font-bold"
              >
                {bloquear.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Crear bloqueo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal: Registrar feriado */}
        <Dialog
          open={modal === 'feriado'}
          onOpenChange={(v) => !v && openModal(null)}
        >
          <DialogContent className="sm:max-w-sm rounded-2xl z-[100] p-0 overflow-hidden border border-gray-100 shadow-xl">
            <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                  <CalendarPlus className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-gray-900 leading-none">
                    Registrar feriado
                  </DialogTitle>
                  <p className="text-xs text-gray-400 mt-1">
                    Marca una fecha como feriado nacional o regional
                  </p>
                </div>
              </div>
            </DialogHeader>

            <form
              onSubmit={handleFeriado}
              className="px-6 py-5 space-y-4 bg-gray-50/40"
            >
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600">
                  Tipo de feriado
                </Label>
                <Select
                  onValueChange={(v) =>
                    feriadoForm.setValue(
                      'tipoFeriado',
                      v as 'NACIONAL' | 'REGIONAL'
                    )
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NACIONAL">Nacional</SelectItem>
                    <SelectItem value="REGIONAL">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600">Fecha</Label>
                <Input
                  type="date"
                  min={hoy}
                  className="h-10 rounded-xl bg-white"
                  {...feriadoForm.register('fecha')}
                />
                {feriadoForm.formState.errors.fecha && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {feriadoForm.formState.errors.fecha.message}
                  </p>
                )}
              </div>

              {tieneAtencionFeriado && (
                <div className="bg-white border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 font-medium">
                    No se puede registrar feriado para hoy con atencion activa.
                  </p>
                </div>
              )}

              {tieneActividadFeriado && !tieneAtencionFeriado && (
                <div className="bg-white border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800">
                    <p className="font-bold">
                      No se puede registrar: dia con actividad
                    </p>
                    <p className="mt-0.5 text-red-700">
                      {conflictoFeriado?.totalReservas} reservas y{' '}
                      {conflictoFeriado?.totalEventos} eventos registrados.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-gray-600">
                  Descripcion
                </Label>
                <Input
                  placeholder="Ej: Dia del Trabajo"
                  className="h-10 rounded-xl bg-white"
                  {...feriadoForm.register('descripcion')}
                />
                {feriadoForm.formState.errors.descripcion && (
                  <p className="text-xs text-destructive">
                    {feriadoForm.formState.errors.descripcion.message}
                  </p>
                )}
              </div>
            </form>

            <DialogFooter className="px-6 py-4 bg-white border-t border-gray-100 gap-2">
              <Button
                variant="ghost"
                onClick={() => openModal(null)}
                className="rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                variant="purple"
                onClick={handleFeriado}
                disabled={
                  crearFeriado.isPending ||
                  tieneAtencionFeriado ||
                  tieneActividadFeriado
                }
                className="rounded-xl gap-1.5 font-bold"
              >
                {crearFeriado.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Registrar feriado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }
)

CalendarioAcciones.displayName = 'CalendarioAcciones'
