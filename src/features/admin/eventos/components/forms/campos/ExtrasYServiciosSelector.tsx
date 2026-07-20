'use client'

import { useEffect, useRef } from 'react'
import {
  Control,
  FieldErrors,
  UseFormRegister,
  useController,
  useWatch,
} from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { NuevoEventoFormValues } from '../../../schema/nuevoEvento.schema'
import { eventosApi } from '../../../services/eventos.api'
import { Checkbox } from '@/components/ui/Checkbox'
import { FormField } from '@/components/ui/FormField'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { cn, formatCurrency } from '@/lib/utils'

interface ExtrasYServiciosSelectorProps {
  control: Control<NuevoEventoFormValues>
  register: UseFormRegister<NuevoEventoFormValues>
  errors: FieldErrors<NuevoEventoFormValues>
  onPendienteChange: (pendiente: boolean) => void
}

export function ExtrasYServiciosSelector({
  control,
  register,
  errors,
  onPendienteChange,
}: ExtrasYServiciosSelectorProps) {
  const idPaquete = useWatch({ control, name: 'idPaquete' })

  const { field: idsExtrasField } = useController({
    control,
    name: 'idsExtras',
  })
  const { field: idsServiciosField } = useController({
    control,
    name: 'idsServiciosCotizacion',
  })
  const { field: variantesField } = useController({
    control,
    name: 'variantesSeleccionadas',
  })

  const { data: extrasPaquete } = useQuery({
    queryKey: ['extras-paquete', idPaquete],
    queryFn: () => eventosApi.listarExtrasPaquete(idPaquete!),
    enabled: !!idPaquete,
  })

  const { data: servicios } = useQuery({
    queryKey: ['servicios-cotizacion'],
    queryFn: () => eventosApi.listarServiciosCotizacion(),
  })

  const prevPaqueteRef = useRef(idPaquete)
  useEffect(() => {
    if (prevPaqueteRef.current !== idPaquete) {
      idsExtrasField.onChange([])
      prevPaqueteRef.current = idPaquete
    }
  }, [idPaquete, idsExtrasField])

  const idsServicios = idsServiciosField.value ?? []
  const variantes = variantesField.value ?? {}
  const serviciosConVariantePendiente = (servicios ?? []).filter(
    (s) =>
      idsServicios.includes(s.id) &&
      s.tieneVariantes &&
      !variantes[String(s.id)]
  )

  useEffect(() => {
    onPendienteChange(serviciosConVariantePendiente.length > 0)
  }, [serviciosConVariantePendiente.length, onPendienteChange])

  const toggleExtra = (idExtra: number, marcado: boolean) => {
    const actual = idsExtrasField.value ?? []
    idsExtrasField.onChange(
      marcado ? [...actual, idExtra] : actual.filter((id) => id !== idExtra)
    )
  }

  const toggleServicio = (idServicio: number, marcado: boolean) => {
    idsServiciosField.onChange(
      marcado
        ? [...idsServicios, idServicio]
        : idsServicios.filter((id) => id !== idServicio)
    )
    if (!marcado) {
      const nuevasVariantes = { ...variantes }
      delete nuevasVariantes[String(idServicio)]
      variantesField.onChange(nuevasVariantes)
    }
  }

  const elegirVariante = (idServicio: number, idVariante: number) => {
    variantesField.onChange({ ...variantes, [String(idServicio)]: idVariante })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Extras y servicios de catálogo
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Selecciona del catálogo — quedan registrados con precio, no como texto
          libre.
        </p>
      </div>

      {!idPaquete ? (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Selecciona un paquete para ver sus extras disponibles.
        </p>
      ) : (
        (extrasPaquete?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Extras del paquete
            </Label>
            <div className="space-y-1.5">
              {extrasPaquete!.map((extra) => {
                const marcado = (idsExtrasField.value ?? []).includes(extra.id)
                const checkboxId = `extra-${extra.id}`
                return (
                  <div key={extra.id} className="flex items-start gap-2.5">
                    <Checkbox
                      id={checkboxId}
                      checked={marcado}
                      onCheckedChange={(checked) =>
                        toggleExtra(extra.id, checked === true)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {extra.nombre}
                      {extra.descripcion && (
                        <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal">
                          {extra.descripcion}
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {(servicios?.length ?? 0) > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Servicios de cotización
          </Label>
          <div className="space-y-2.5">
            {servicios!.map((s) => {
              const activo = idsServicios.includes(s.id)
              const idVarianteElegida = variantes[String(s.id)]
              const checkboxId = `servicio-${s.id}`
              return (
                <div key={s.id} className="space-y-1.5">
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id={checkboxId}
                      checked={activo}
                      onCheckedChange={(checked) =>
                        toggleServicio(s.id, checked === true)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={checkboxId}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {s.nombre}
                      <span className="block text-xs text-gray-400 dark:text-gray-500 font-normal">
                        {s.tieneVariantes
                          ? `Desde ${formatCurrency(s.precioDesde ?? 0)}`
                          : s.precioReferencial
                            ? formatCurrency(s.precioReferencial)
                            : 'A consultar'}
                      </span>
                    </Label>
                  </div>

                  {activo && s.tieneVariantes && (
                    <div
                      role="radiogroup"
                      aria-label={`Variante de ${s.nombre}`}
                      className="pl-7 flex flex-wrap gap-1.5"
                    >
                      {s.variantes
                        .filter((v) => v.activo)
                        .map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            role="radio"
                            aria-checked={idVarianteElegida === v.id}
                            onClick={() => elegirVariante(s.id, v.id)}
                            className={cn(
                              'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors',
                              idVarianteElegida === v.id
                                ? 'bg-brand-azul text-white border-brand-azul'
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-brand-azul/50'
                            )}
                          >
                            {v.nombre} · {formatCurrency(v.precio)}
                          </button>
                        ))}
                    </div>
                  )}
                  {activo && s.tieneVariantes && !idVarianteElegida && (
                    <p className="pl-7 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Elige una opción para incluir este servicio
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <FormField
        id="extrasLibres"
        label="Otros extras (fuera del catálogo)"
        error={errors.extrasLibres?.message}
        hint="¿Algo que no está en la lista de arriba? Descríbelo aquí, uno por línea."
      >
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            {...register('extrasLibres')}
            placeholder={
              'Un extra por línea\nEj: Torta personalizada\nEj: Decoración temática'
            }
            rows={3}
            className="rounded-xl resize-none dark:bg-gray-800 dark:border-gray-700"
          />
        )}
      </FormField>
    </div>
  )
}
