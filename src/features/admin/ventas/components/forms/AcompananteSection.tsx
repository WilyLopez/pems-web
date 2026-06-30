import React from 'react'
import { Controller, Control, useWatch, useFormContext } from 'react-hook-form'
import { Loader2, Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { VentaMostradorFormValues } from '../../schema/ventaMostrador.schema'

interface AcompananteSectionProps {
  control: Control<VentaMostradorFormValues>
  errors: any
  consultandoDni: boolean
  acompananteDni: string
  consultarAcompananteDni: () => void
  statusBusqueda: 'IDLE' | 'BUSCANDO' | 'ENCONTRADO' | 'NO_ENCONTRADO'
}

export const AcompananteSection = ({
  control,
  errors,
  consultandoDni,
  acompananteDni,
  consultarAcompananteDni,
  statusBusqueda,
}: AcompananteSectionProps) => {
  const { setValue } = useFormContext()
  const tipoDocumento = useWatch({ control, name: 'acompanante.tipoDocumento' }) || 'DNI'
  const isRuc = tipoDocumento === 'RUC'
  const len = isRuc ? 11 : 8

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      consultarAcompananteDni()
    }
  }

  const handleBlur = () => {
    if (acompananteDni && acompananteDni.trim().length === len && statusBusqueda === 'IDLE') {
      consultarAcompananteDni()
    }
  }

  return (
    <div className="space-y-2.5 p-3.5 bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl">
      <div className="flex items-center justify-between">
        <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Tipo de Cliente
        </Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setValue('acompanante.tipoDocumento', 'DNI')
              setValue('acompanante.dni', '')
              setValue('acompanante.nombre', '')
            }}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all',
              tipoDocumento === 'DNI'
                ? 'bg-brand-azul text-white border-brand-azul'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
            )}
          >
            Persona natural
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('acompanante.tipoDocumento', 'RUC')
              setValue('acompanante.dni', '')
              setValue('acompanante.nombre', '')
            }}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all',
              tipoDocumento === 'RUC'
                ? 'bg-brand-azul text-white border-brand-azul'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
            )}
          >
            Empresa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex justify-between items-baseline h-5">
            <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              {isRuc ? 'RUC de la Empresa' : 'DNI del Acompañante'}
            </Label>
            <span className="text-[8px] opacity-0 select-none">Spacer</span>
          </div>
          <div className="flex gap-1.5 items-center">
            <div className="relative flex-1">
              <Controller
                control={control}
                name="acompanante.dni"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="documento-input"
                    placeholder={isRuc ? 'Ingresa RUC' : 'Ingresa DNI'}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, '').slice(0, len))
                    }
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    className={cn(
                      'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 pr-8 w-full',
                      errors.acompanante?.dni && 'border-red-400 dark:border-red-600'
                    )}
                  />
                )}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                {consultandoDni && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={consultandoDni || !acompananteDni || acompananteDni.length !== len}
              onClick={consultarAcompananteDni}
              className="px-2.5 h-8 rounded-lg shrink-0 border-gray-200 dark:border-gray-800"
              title="Buscar documento"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>

          {statusBusqueda !== 'IDLE' && (
            <div className="flex items-center gap-1 pl-1">
              {statusBusqueda === 'BUSCANDO' && (
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1 animate-pulse">
                  Buscando...
                </span>
              )}
              {statusBusqueda === 'ENCONTRADO' && (
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Encontrado ✓
                </span>
              )}
              {statusBusqueda === 'NO_ENCONTRADO' && (
                <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-0.5">
                  <AlertCircle className="h-2.5 w-2.5" /> No encontrado
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-baseline h-5">
            <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Celular (Opcional)
            </Label>
            <span className="text-[8px] text-brand-azul font-medium truncate max-w-[130px]" title="Recibe confirmación de reserva por WhatsApp">
              WhatsApp
            </span>
          </div>
          <Controller
            control={control}
            name="acompanante.telefono"
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Celular"
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/\D/g, '').slice(0, 9))
                }
                className={cn(
                  'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 w-full',
                  errors.acompanante?.telefono && 'border-red-400 dark:border-red-600'
                )}
              />
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
            {isRuc ? 'Razón Social' : 'Nombre Completo'}
          </Label>
          <Controller
            control={control}
            name="acompanante.nombre"
            render={({ field }) => (
              <Input
                {...field}
                placeholder={isRuc ? 'Razón Social de la empresa' : 'Nombre completo del acompañante'}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                className={cn(
                  'h-8 text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 w-full',
                  errors.acompanante?.nombre && 'border-red-400 dark:border-red-600'
                )}
              />
            )}
          />
        </div>
      </div>

      {(errors.acompanante?.nombre ||
        errors.acompanante?.dni ||
        errors.acompanante?.telefono) && (
        <p className="text-[10px] text-red-500 dark:text-red-400 font-bold">
          {errors.acompanante?.nombre?.message ||
            errors.acompanante?.dni?.message ||
            errors.acompanante?.telefono?.message}
        </p>
      )}
    </div>
  )
}
