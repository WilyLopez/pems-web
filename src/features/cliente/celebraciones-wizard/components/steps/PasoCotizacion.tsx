'use client'

import {
  ChevronRight,
  Info,
  Check,
  CheckCircle2,
  Calculator,
  AlertTriangle,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormField } from '@/components/ui/FormField'
import { ServicioCotizacion } from '@/types/evento.types'
import { WizardValidationErrors } from '../../hooks/useSolicitarEventoWizard'
import { FieldError } from '../ui/FieldError'

interface Props {
  descripcion: string
  setDescripcion: (value: string) => void
  servicios: ServicioCotizacion[]
  serviciosCotizacion: number[]
  variantesSeleccionadas: Record<number, number>
  toggleServicio: (id: number) => void
  setVarianteServicio: (idServicio: number, idVariante: number) => void
  presupuestoEstimado: number
  presupuestoCliente: number | null
  setPresupuestoCliente: (value: number | null) => void
  validationErrors: WizardValidationErrors
  canAdvance2: boolean
  serviciosConVariantePendiente: ServicioCotizacion[]
  onAtras: () => void
  onContinuar: () => void
}

export function PasoCotizacion({
  descripcion,
  setDescripcion,
  servicios,
  serviciosCotizacion,
  variantesSeleccionadas,
  toggleServicio,
  setVarianteServicio,
  presupuestoEstimado,
  presupuestoCliente,
  setPresupuestoCliente,
  validationErrors,
  canAdvance2,
  serviciosConVariantePendiente,
  onAtras,
  onContinuar,
}: Props) {
  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
      <div>
        <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
          Paso 2 de 4
        </Badge>
        <h2 className="text-2xl font-black text-gray-900">Cuéntanos tu idea</h2>
        <p className="text-sm text-gray-500 mt-1">
          Mientras más nos cuentes, mejor será la propuesta que te preparemos.
        </p>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Prepararemos una propuesta personalizada y te contactaremos en{' '}
          <strong>24–48 horas</strong>.
        </p>
      </div>

      <FormField
        id="descripcion"
        label="Describe tu evento"
        required
        error={validationErrors.descripcion}
      >
        {(fieldProps) => (
          <>
            <textarea
              {...fieldProps}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos qué tipo de celebración imaginas, la temática, el ambiente que buscas..."
              rows={4}
              maxLength={1000}
              className={cn(
                'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white min-h-[80px] sm:min-h-[100px]',
                validationErrors.descripcion
                  ? 'border-red-400'
                  : 'border-gray-200'
              )}
            />
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
              {!validationErrors.descripcion && descripcion.length >= 30 && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  Descripción completa
                </span>
              )}
              <span
                className={cn(
                  'text-gray-400 ml-auto shrink-0',
                  descripcion.length > 950 && 'text-amber-600 font-semibold'
                )}
              >
                {descripcion.length}/1000
              </span>
            </div>
          </>
        )}
      </FormField>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          ¿Qué servicios te gustaría incluir?
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {servicios.map((servicio) => {
            const activo = serviciosCotizacion.includes(servicio.id)
            const idVarianteElegida = variantesSeleccionadas[servicio.id]
            const faltaVariante =
              activo && servicio.tieneVariantes && !idVarianteElegida
            return (
              <div key={servicio.id} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => toggleServicio(servicio.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all bg-white',
                    activo
                      ? 'border-brand-azul bg-brand-azul/5'
                      : 'border-gray-200 hover:border-brand-azul/30'
                  )}
                >
                  {servicio.imagenPrincipal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={servicio.imagenPrincipal}
                      alt=""
                      className="h-12 w-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {servicio.nombre}
                    </p>
                    {servicio.descripcion && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                        {servicio.descripcion}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {servicio.tieneVariantes
                        ? `Desde ${formatCurrency(servicio.precioDesde ?? 0)}`
                        : servicio.precioReferencial
                          ? `desde ${formatCurrency(servicio.precioReferencial)}`
                          : 'A consultar'}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                      activo
                        ? 'bg-brand-azul border-brand-azul'
                        : 'border-gray-300'
                    )}
                  >
                    {activo && <Check className="h-3 w-3 text-white" />}
                  </div>
                </button>

                {activo && servicio.tieneVariantes && (
                  <div className="pl-1">
                    <div className="flex flex-wrap gap-1.5">
                      {servicio.variantes
                        .filter((v) => v.activo)
                        .map((variante) => (
                          <button
                            key={variante.id}
                            type="button"
                            onClick={() =>
                              setVarianteServicio(servicio.id, variante.id)
                            }
                            className={cn(
                              'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                              idVarianteElegida === variante.id
                                ? 'bg-brand-azul text-white border-brand-azul'
                                : 'border-gray-300 text-gray-600 hover:border-brand-azul/50'
                            )}
                          >
                            {variante.nombre} ·{' '}
                            {formatCurrency(variante.precio)}
                          </button>
                        ))}
                    </div>
                    {faltaVariante && (
                      <FieldError message="Elige una opción para continuar" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {presupuestoEstimado > 0 && (
        <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                Presupuesto estimado (servicios)
              </p>
              <p className="text-2xl font-black text-brand-azul mt-1">
                {formatCurrency(presupuestoEstimado)}
              </p>
            </div>
            <Calculator className="h-8 w-8 text-brand-azul/40" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Estimado orientativo. El precio final lo confirma el equipo tras
            revisar tu solicitud.
          </p>
        </div>
      )}

      <FormField
        id="presupuesto-coti"
        label={
          <>
            ¿Cuál es tu presupuesto aproximado?{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </>
        }
        hint="Nos ayuda a preparar una propuesta ajustada a tus posibilidades."
        error={validationErrors.presupuestoCliente}
      >
        {(fieldProps) => (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 select-none">
              S/
            </span>
            <Input
              {...fieldProps}
              type="number"
              placeholder="Ej: 1500"
              min={1}
              max={50000}
              value={presupuestoCliente ?? ''}
              onChange={(e) =>
                setPresupuestoCliente(
                  e.target.value ? parseFloat(e.target.value) : null
                )
              }
              className={cn(
                'h-11 rounded-xl pl-9',
                validationErrors.presupuestoCliente && 'border-red-400'
              )}
            />
          </div>
        )}
      </FormField>

      <div className="space-y-2 pt-1">
        {!canAdvance2 && descripcion.length < 30 && (
          <p className="text-xs text-gray-500 text-center">
            Escribe al menos 30 caracteres para continuar
          </p>
        )}
        {serviciosConVariantePendiente.length > 0 && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium text-center">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            Elige una opción para cada servicio seleccionado
          </p>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12"
            onClick={onAtras}
          >
            Atrás
          </Button>
          <Button
            className="flex-1 bg-brand-rosa hover:bg-brand-rosa/90 disabled:opacity-40 text-white rounded-xl gap-2 h-12"
            disabled={!canAdvance2 || serviciosConVariantePendiente.length > 0}
            onClick={onContinuar}
          >
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
