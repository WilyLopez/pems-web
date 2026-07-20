'use client'

import {
  Users,
  Phone,
  Clock,
  Info,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormField } from '@/components/ui/FormField'
import { Turno } from '@/types/evento.types'
import { Disponibilidad } from '@/features/admin/calendario/types'
import { WizardValidationErrors } from '../../hooks/useSolicitarEventoWizard'
import { Camino } from '../../../shared/types'
import { FieldError } from '../ui/FieldError'
import { FieldWarning } from '../ui/FieldWarning'
import { CalendarioFechaWizard } from '../ui/CalendarioFechaWizard'

interface Props {
  anticipacionMin: number
  fechaMin: string
  fechaMax: string
  fechaSel: string | null
  onSeleccionarFecha: (valor: string) => void
  fechasOcupadas: Set<string>
  isTurnosError: boolean
  isTurnosLoading: boolean
  isDisponibilidadDiaLoading: boolean
  turnos: Turno[]
  disponibilidadDia?: Disponibilidad
  idTurno: number | null
  setIdTurno: (id: number) => void
  tipoEvento: string | null
  nombreNino: string
  setNombreNino: (value: string) => void
  edadCumple: number | null
  setEdadCumple: (value: number | null) => void
  edadMin: number
  edadMax: number
  invitados: number | null
  setInvitados: (value: number | null) => void
  invitadosTocado: boolean
  invitadosExcedeLimite: boolean | null
  limitePersonas: number | null
  camino: Camino
  telefonoAdicional: string
  setTelefonoAdicional: (value: string) => void
  validationErrors: WizardValidationErrors
  canAdvance3: boolean
  onAtras: () => void
  onContinuar: () => void
}

export function PasoFechaDetalles({
  anticipacionMin,
  fechaMin,
  fechaMax,
  fechaSel,
  onSeleccionarFecha,
  fechasOcupadas,
  isTurnosError,
  isTurnosLoading,
  isDisponibilidadDiaLoading,
  turnos,
  disponibilidadDia,
  idTurno,
  setIdTurno,
  tipoEvento,
  nombreNino,
  setNombreNino,
  edadCumple,
  setEdadCumple,
  edadMin,
  edadMax,
  invitados,
  setInvitados,
  invitadosTocado,
  invitadosExcedeLimite,
  limitePersonas,
  camino,
  telefonoAdicional,
  setTelefonoAdicional,
  validationErrors,
  canAdvance3,
  onAtras,
  onContinuar,
}: Props) {
  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
      <div>
        <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
          Paso 3 de 4
        </Badge>
        <h2 className="text-2xl font-black text-gray-900">Fecha y detalles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Elige cuándo quieres tu evento.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          Fecha y horario
        </h3>

        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">
            Fecha del evento <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-gray-400">
            La reserva debe realizarse con al menos {anticipacionMin} días de
            anticipación. Los días no disponibles aparecen deshabilitados.
          </p>
          <CalendarioFechaWizard
            fechaSel={fechaSel}
            onSeleccionarFecha={onSeleccionarFecha}
            fechaMin={fechaMin}
            fechaMax={fechaMax}
            fechasOcupadas={fechasOcupadas}
          />
          {fechaSel && fechasOcupadas.has(fechaSel) && (
            <FieldError message="Fecha no disponible. Por favor selecciona otra fecha." />
          )}
        </div>

        {fechaSel && !fechasOcupadas.has(fechaSel) && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Turno preferido <span className="text-destructive">*</span>
            </Label>
            {isTurnosError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">
                  No se pudieron cargar los turnos disponibles. Por favor
                  recarga la página.
                </p>
              </div>
            )}
            {(isTurnosLoading || isDisponibilidadDiaLoading) && (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            )}
            {!isTurnosError &&
              !isTurnosLoading &&
              !isDisponibilidadDiaLoading &&
              turnos.length === 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    No hay turnos configurados para esta sede.
                  </p>
                </div>
              )}
            {!isTurnosLoading && !isDisponibilidadDiaLoading && (
              <div className="grid grid-cols-2 gap-2">
                {turnos.map((turno) => {
                  const disponibilidadPorCodigo: Record<
                    string,
                    boolean | undefined
                  > = {
                    T1: disponibilidadDia?.turnoT1Disponible,
                    T2: disponibilidadDia?.turnoT2Disponible,
                  }
                  const disponible =
                    disponibilidadPorCodigo[turno.codigo] ?? false
                  const seleccionado = idTurno === turno.id
                  return (
                    <button
                      key={turno.id}
                      type="button"
                      disabled={!disponible}
                      aria-pressed={seleccionado}
                      onClick={() => disponible && setIdTurno(turno.id)}
                      className={cn(
                        'border rounded-xl p-3.5 text-left transition-all bg-white',
                        !disponible
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : seleccionado
                            ? 'border-brand-rosa bg-brand-rosa/5 ring-1 ring-brand-rosa'
                            : 'border-gray-200 hover:border-brand-rosa/40'
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <p className="text-sm font-bold text-gray-900">
                          {turno.nombre}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {turno.horaInicio} – {turno.horaFin}
                      </p>
                      {!disponible && (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                          No disponible
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {tipoEvento === 'CUMPLEANOS' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Sobre el cumpleañero/a
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              id="nombreNino"
              label="Nombre del cumpleañero/a"
              required
              error={validationErrors.nombreNino}
            >
              {(fieldProps) => (
                <Input
                  {...fieldProps}
                  placeholder="Ej: María José"
                  value={nombreNino}
                  onChange={(e) => setNombreNino(e.target.value)}
                  className={cn(
                    'h-11 rounded-xl',
                    validationErrors.nombreNino && 'border-red-400'
                  )}
                  maxLength={60}
                />
              )}
            </FormField>
            <div className="space-y-1.5">
              <FormField
                id="edadCumple"
                label="Edad que cumple"
                required
                error={validationErrors.edadCumple}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    placeholder="5"
                    min={edadMin}
                    max={edadMax}
                    value={edadCumple ?? ''}
                    onChange={(e) =>
                      setEdadCumple(
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    className={cn(
                      'h-11 rounded-xl',
                      validationErrors.edadCumple && 'border-red-400'
                    )}
                  />
                )}
              </FormField>
              {edadCumple !== null &&
                edadCumple >= Math.max(10, edadMax - 5) &&
                !validationErrors.edadCumple && (
                  <FieldWarning message="Este paquete está pensado para niños. ¿Es correcto?" />
                )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          Invitados y contacto
        </h3>

        <div className="space-y-1.5">
          <FormField
            id="invitados-paso3"
            label="Número aproximado de invitados"
            required
            error={validationErrors.invitados}
            hint={
              !invitadosTocado && invitados !== null
                ? 'Sugerido por el paquete, puedes ajustarlo.'
                : undefined
            }
          >
            {(fieldProps) => (
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...fieldProps}
                  type="number"
                  placeholder="20"
                  min={1}
                  max={500}
                  value={invitados ?? ''}
                  onChange={(e) =>
                    setInvitados(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className={cn(
                    'h-11 rounded-xl pl-9',
                    validationErrors.invitados && 'border-red-400'
                  )}
                />
              </div>
            )}
          </FormField>
          {invitadosExcedeLimite && !validationErrors.invitados && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-1">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                El paquete seleccionado tiene un límite de {limitePersonas}{' '}
                personas. Si tienes más invitados, considera solicitar una
                cotización personalizada.
              </p>
            </div>
          )}
          {camino === 'cotizacion' && invitados !== null && invitados > 500 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mt-1">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Es un número grande de invitados. El equipo evaluará la
                disponibilidad y te lo confirmará en la cotización.
              </p>
            </div>
          )}
        </div>

        <FormField
          id="telefono"
          label={
            <>
              Teléfono de contacto adicional{' '}
              <span className="text-gray-400 font-normal">(opcional)</span>
            </>
          }
          hint="Celular de 9 dígitos que comience con 9."
          error={validationErrors.telefonoAdicional}
        >
          {(fieldProps) => (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                {...fieldProps}
                placeholder="987654321"
                value={telefonoAdicional}
                onChange={(e) => setTelefonoAdicional(e.target.value)}
                className={cn(
                  'h-11 rounded-xl pl-9',
                  validationErrors.telefonoAdicional && 'border-red-400'
                )}
                maxLength={15}
              />
            </div>
          )}
        </FormField>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={onAtras}
        >
          Atrás
        </Button>
        <Button
          className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 text-white rounded-xl gap-2"
          disabled={!canAdvance3}
          onClick={onContinuar}
        >
          Ver resumen <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
