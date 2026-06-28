'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Settings,
  Loader2,
  Users,
  CalendarDays,
  Lock,
  Clock,
  Cake,
  HelpCircle,
  Save,
} from 'lucide-react'

import {
  useConfiguracionCalendario,
  useActualizarConfiguracion,
} from '../../hooks/useCalendarData'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip'
import { cn } from '@/lib/utils'

/* ── Schema ── */
const configSchema = z
  .object({
    aforoMaximo: z
      .number()
      .min(1, 'Mínimo 1 persona')
      .max(500, 'Máximo 500 personas'),
    diasMinReservaPublica: z.number().min(0, 'No puede ser negativo'),
    diasMaxReservaPublica: z.number().min(1, 'Mínimo 1 día'),
    diasMinEventoPrivado: z.number().min(0, 'No puede ser negativo'),
    diasMaxEventoPrivado: z.number().min(1, 'Mínimo 1 día'),
    horaApertura: z.string().min(5, 'Requerido'),
    horaCierre: z.string().min(5, 'Requerido'),
    diasOperacion: z.string(),
    edadMinCumple: z.number().min(0).max(99),
    edadMaxCumple: z.number().min(0).max(99),
  })
  .refine((d) => d.diasMinReservaPublica < d.diasMaxReservaPublica, {
    message: 'El mínimo debe ser menor que el máximo',
    path: ['diasMaxReservaPublica'],
  })
  .refine((d) => d.diasMinEventoPrivado < d.diasMaxEventoPrivado, {
    message: 'El mínimo debe ser menor que el máximo',
    path: ['diasMaxEventoPrivado'],
  })
  .refine((d) => d.horaApertura < d.horaCierre, {
    message: 'La apertura debe ser antes del cierre',
    path: ['horaCierre'],
  })
  .refine((d) => d.edadMinCumple <= d.edadMaxCumple, {
    message: 'La edad mínima no puede superar la máxima',
    path: ['edadMaxCumple'],
  })

type ConfigForm = z.infer<typeof configSchema>

/* ── Helpers ── */
function FieldLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-3.5 w-3.5 text-gray-300 hover:text-gray-500 cursor-help transition-colors shrink-0" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-[220px] text-center leading-relaxed"
          >
            {hint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[10px] text-red-500 mt-0.5">{message}</p>
}

function Section({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: React.ElementType
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'h-6 w-6 rounded-lg flex items-center justify-center shrink-0',
            color
          )}
        >
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}

/* ── Component ── */
interface ConfigurarCalendarioModalProps {
  idSede: number
  open: boolean
  onClose: () => void
}

export const ConfigurarCalendarioModal = React.memo(
  ({ idSede, open, onClose }: ConfigurarCalendarioModalProps) => {
    const { data: config, isLoading } = useConfiguracionCalendario(idSede)
    const actualizar = useActualizarConfiguracion(idSede)

    const form = useForm<ConfigForm>({
      resolver: zodResolver(configSchema),
      values: config
        ? {
            aforoMaximo: config.aforoMaximo,
            diasMinReservaPublica: config.diasMinReservaPublica,
            diasMaxReservaPublica: config.diasMaxReservaPublica,
            diasMinEventoPrivado: config.diasMinEventoPrivado,
            diasMaxEventoPrivado: config.diasMaxEventoPrivado,
            horaApertura: config.horaApertura,
            horaCierre: config.horaCierre,
            diasOperacion: config.diasOperacion,
            edadMinCumple: config.edadMinCumple,
            edadMaxCumple: config.edadMaxCumple,
          }
        : undefined,
    })

    const err = form.formState.errors

    const onSubmit = (values: ConfigForm) => {
      if (!config) return
      const { idSede: _, ...restConfig } = config
      actualizar.mutate(
        { ...restConfig, ...values },
        { onSuccess: () => onClose() }
      )
    }

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border border-gray-100 shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <DialogHeader className="px-6 py-5 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <Settings className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-gray-900 leading-none">
                  Configurar calendario
                </DialogTitle>
                <p className="text-xs text-gray-400 mt-1">
                  Reglas de operación y disponibilidad del local
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Body */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-sm text-gray-400">
                Cargando configuración...
              </span>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-6"
            >
              {/* Capacidad */}
              <Section icon={Users} title="Capacidad" color="bg-blue-500">
                <div className="bg-gray-50 rounded-xl p-4">
                  <FieldLabel
                    label="Aforo máximo"
                    hint="Cantidad máxima de reservas públicas que pueden existir en un mismo día. Al alcanzarse, el día se cierra automáticamente."
                  />
                  <Input
                    type="number"
                    className="mt-2 bg-white"
                    {...form.register('aforoMaximo', { valueAsNumber: true })}
                  />
                  <FieldError message={err.aforoMaximo?.message} />
                </div>
              </Section>

              <div className="border-t border-gray-100" />

              {/* Reservas públicas */}
              <Section
                icon={CalendarDays}
                title="Reservas públicas"
                color="bg-emerald-500"
              >
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Ventana de tiempo dentro de la cual los clientes pueden
                    hacer reservas para el público general.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel
                        label="Anticipación mínima"
                        hint="Días mínimos de antelación con los que un cliente puede reservar. Con valor 0 puede reservar el mismo día."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          className="bg-white pr-12"
                          {...form.register('diasMinReservaPublica', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          días
                        </span>
                      </div>
                      <FieldError
                        message={err.diasMinReservaPublica?.message}
                      />
                    </div>
                    <div>
                      <FieldLabel
                        label="Anticipación máxima"
                        hint="Días máximos con anticipación que un cliente puede reservar. Fechas más lejanas no estarán disponibles para reserva."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          className="bg-white pr-12"
                          {...form.register('diasMaxReservaPublica', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          días
                        </span>
                      </div>
                      <FieldError
                        message={err.diasMaxReservaPublica?.message}
                      />
                    </div>
                  </div>
                </div>
              </Section>

              <div className="border-t border-gray-100" />

              {/* Eventos privados */}
              <Section
                icon={Lock}
                title="Eventos privados"
                color="bg-violet-500"
              >
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Ventana de tiempo para agendar eventos privados (cumpleaños,
                    corporativos, etc.).
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel
                        label="Anticipación mínima"
                        hint="Días mínimos antes del evento que el cliente debe confirmar. Permite preparar la logística con tiempo."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          className="bg-white pr-12"
                          {...form.register('diasMinEventoPrivado', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          días
                        </span>
                      </div>
                      <FieldError message={err.diasMinEventoPrivado?.message} />
                    </div>
                    <div>
                      <FieldLabel
                        label="Anticipación máxima"
                        hint="Máximo de días en el futuro que se puede reservar para un evento privado. Evita reservar fechas demasiado lejanas."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          className="bg-white pr-12"
                          {...form.register('diasMaxEventoPrivado', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          días
                        </span>
                      </div>
                      <FieldError message={err.diasMaxEventoPrivado?.message} />
                    </div>
                  </div>
                </div>
              </Section>

              <div className="border-t border-gray-100" />

              {/* Horario */}
              <Section
                icon={Clock}
                title="Horario de operación"
                color="bg-orange-500"
              >
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    El sistema bloqueará reservas fuera de este horario. Pasada
                    la hora de cierre, el día de hoy ya no aceptará reservas
                    nuevas.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel
                        label="Hora de apertura"
                        hint="Hora desde la cual el local está disponible para reservas y eventos."
                      />
                      <Input
                        type="time"
                        className="mt-2 bg-white"
                        {...form.register('horaApertura')}
                      />
                      <FieldError message={err.horaApertura?.message} />
                    </div>
                    <div>
                      <FieldLabel
                        label="Hora de cierre"
                        hint="A partir de esta hora, el día de hoy deja de aparecer como disponible para reservas públicas."
                      />
                      <Input
                        type="time"
                        className="mt-2 bg-white"
                        {...form.register('horaCierre')}
                      />
                      <FieldError message={err.horaCierre?.message} />
                    </div>
                  </div>
                </div>
              </Section>

              <div className="border-t border-gray-100" />

              {/* Cumpleaños */}
              <Section icon={Cake} title="Cumpleaños" color="bg-pink-500">
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Rango de edades que el local acepta para celebraciones de
                    cumpleaños.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel
                        label="Edad mínima"
                        hint="Edad más baja del cumpleañero que el local acepta para este tipo de evento."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          className="bg-white pr-12"
                          {...form.register('edadMinCumple', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          años
                        </span>
                      </div>
                      <FieldError message={err.edadMinCumple?.message} />
                    </div>
                    <div>
                      <FieldLabel
                        label="Edad máxima"
                        hint="Edad más alta del cumpleañero que el local acepta. Útil si el local es solo para niños, por ejemplo."
                      />
                      <div className="relative mt-2">
                        <Input
                          type="number"
                          min={0}
                          max={99}
                          className="bg-white pr-12"
                          {...form.register('edadMaxCumple', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 pointer-events-none">
                          años
                        </span>
                      </div>
                      <FieldError message={err.edadMaxCumple?.message} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Footer pegado al bottom del scroll */}
              <div className="pt-2 pb-1 flex items-center justify-end gap-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl h-10 px-5 text-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl h-10 px-5 text-sm gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={actualizar.isPending}
                >
                  {actualizar.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar cambios
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    )
  }
)

ConfigurarCalendarioModal.displayName = 'ConfigurarCalendarioModal'
