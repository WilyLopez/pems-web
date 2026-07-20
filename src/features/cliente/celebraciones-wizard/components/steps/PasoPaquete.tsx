'use client'

import { ChevronRight, Info, Check } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { FormField } from '@/components/ui/FormField'
import { PaqueteEvento } from '@/types/comercial.types'
import { ExtraPaquete } from '@/types/evento.types'
import { WizardValidationErrors } from '../../hooks/useSolicitarEventoWizard'

interface Props {
  paqueteSeleccionado: PaqueteEvento | null
  onCambiarPaquete: () => void
  extras: ExtraPaquete[]
  extrasSeleccionados: number[]
  toggleExtra: (id: number) => void
  otrasIdeas: string
  setOtrasIdeas: (value: string) => void
  presupuestoCliente: number | null
  setPresupuestoCliente: (value: number | null) => void
  validationErrors: WizardValidationErrors
  canAdvance2: boolean
  onAtras: () => void
  onContinuar: () => void
}

export function PasoPaquete({
  paqueteSeleccionado,
  onCambiarPaquete,
  extras,
  extrasSeleccionados,
  toggleExtra,
  otrasIdeas,
  setOtrasIdeas,
  presupuestoCliente,
  setPresupuestoCliente,
  validationErrors,
  canAdvance2,
  onAtras,
  onContinuar,
}: Props) {
  return (
    <div className="space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-100">
      <div>
        <Badge className="bg-brand-rosa/10 text-brand-rosa border-brand-rosa/20 mb-2">
          Paso 2 de 4
        </Badge>
        <h2 className="text-2xl font-black text-gray-900">
          Personaliza tu paquete
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Agrega lo que quieras incluir. El precio final lo confirma el equipo.
        </p>
      </div>

      {paqueteSeleccionado && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            {paqueteSeleccionado.color && (
              <div
                className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: paqueteSeleccionado.color }}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm line-clamp-1">
                {paqueteSeleccionado.nombre}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {paqueteSeleccionado.descripcionCorta}
              </p>
              {paqueteSeleccionado.limitepersonas && (
                <p className="text-xs text-amber-600 font-medium mt-1">
                  Capacidad máxima: {paqueteSeleccionado.limitepersonas}{' '}
                  personas
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-gray-400 leading-none">desde</p>
              <p className="font-black text-gray-900 text-base leading-tight">
                {formatCurrency(paqueteSeleccionado.precio)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCambiarPaquete}
            className="mt-3 text-xs text-brand-azul font-semibold hover:underline"
          >
            Cambiar paquete
          </button>
        </div>
      )}

      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          El precio final incluirá los extras que elijas. Te contactaremos en{' '}
          <strong>24–48 horas</strong> con la cotización completa.
        </p>
      </div>

      {extras.length > 0 && (
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-semibold">Extras disponibles</Label>
            <p className="text-xs text-gray-400 mt-0.5">
              El precio de cada extra se confirmará en la cotización.
            </p>
          </div>
          <div className="space-y-2">
            {extras.map((ex) => {
              const marcado = extrasSeleccionados.includes(ex.id)
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => toggleExtra(ex.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                    marcado
                      ? 'border-brand-rosa bg-brand-rosa/5'
                      : 'border-gray-200 hover:border-brand-rosa/30 bg-white'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0',
                      marcado
                        ? 'bg-brand-rosa border-brand-rosa'
                        : 'border-gray-300'
                    )}
                  >
                    {marcado && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {ex.nombre}
                    </p>
                    {ex.descripcion && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {ex.descripcion}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                    A cotizar
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <FormField
        id="otrasIdeas"
        label={
          <>
            ¿Algo más en mente?{' '}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </>
        }
        error={validationErrors.otrasIdeas}
      >
        {(fieldProps) => (
          <>
            <textarea
              {...fieldProps}
              value={otrasIdeas}
              onChange={(e) => setOtrasIdeas(e.target.value)}
              placeholder="Cuéntanos cualquier idea adicional para tu evento"
              rows={3}
              maxLength={500}
              className={cn(
                'w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-1 focus:ring-brand-rosa bg-white min-h-[80px]',
                validationErrors.otrasIdeas
                  ? 'border-red-400'
                  : 'border-gray-200'
              )}
            />
            <div className="flex justify-end text-xs">
              <span
                className={cn(
                  'text-gray-400',
                  otrasIdeas.length > 450 && 'text-amber-600 font-semibold'
                )}
              >
                {otrasIdeas.length}/500
              </span>
            </div>
          </>
        )}
      </FormField>

      <FormField
        id="presupuesto-paq"
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
        {!canAdvance2 && Object.keys(validationErrors).length > 0 && (
          <p className="text-xs text-red-500 text-center">
            Corrige los errores para continuar
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
            disabled={!canAdvance2}
            onClick={onContinuar}
          >
            Continuar <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
