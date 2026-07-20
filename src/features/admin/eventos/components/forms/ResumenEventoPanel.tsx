'use client'

import { Control, useWatch } from 'react-hook-form'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock,
  Package,
  PartyPopper,
  Radio,
  User,
  Users,
} from 'lucide-react'
import {
  NuevoEventoFormValues,
  ORIGENES_CONTACTO,
} from '../../schema/nuevoEvento.schema'
import { Turno } from '../../types'
import { Cliente } from '@/features/admin/clientes/types'
import { PaqueteEvento, TipoEvento } from '@/types/comercial.types'
import { formatCurrency } from '@/lib/utils'

interface ResumenEventoPanelProps {
  control: Control<NuevoEventoFormValues>
  fechaParam: string
  turnoActual: Turno | undefined
  clienteSel: Cliente | null
  tipoEventoSel: TipoEvento | null
  paquetesFiltrados: PaqueteEvento[]
}

export function ResumenEventoPanel({
  control,
  fechaParam,
  turnoActual,
  clienteSel,
  tipoEventoSel,
  paquetesFiltrados,
}: ResumenEventoPanelProps) {
  const watchValues = useWatch({ control })
  const paqueteSel = paquetesFiltrados.find(
    (p) => p.id === watchValues.idPaquete
  )

  const esCumpleanos = tipoEventoSel?.codigo === 'CUMPLEANOS'
  const camposFaltantes = [
    !clienteSel && 'Cliente',
    !tipoEventoSel && 'Tipo de evento',
    esCumpleanos && !watchValues.nombreNino && 'Nombre del niño',
    esCumpleanos && watchValues.edadCumple === undefined && 'Edad que cumple',
  ].filter((v): v is string => typeof v === 'string')
  const listoParaCrear = camposFaltantes.length === 0

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4 lg:sticky lg:top-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
        Resumen del evento
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <CalendarDays className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Fecha
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {format(parseISO(fechaParam), "d 'de' MMMM yyyy", {
                locale: es,
              })}
            </p>
          </div>
        </div>

        {turnoActual && (
          <div className="flex items-start gap-2.5">
            <Clock className="h-4 w-4 text-brand-azul shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Turno
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {turnoActual.nombre} · {turnoActual.horaInicio}–
                {turnoActual.horaFin}
              </p>
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 dark:border-gray-800" />

        <div className="flex items-start gap-2.5">
          <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Cliente
            </p>
            {clienteSel ? (
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {clienteSel.nombreCompleto}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin seleccionar
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <PartyPopper className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Tipo de evento
            </p>
            {tipoEventoSel ? (
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {tipoEventoSel.nombre}
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sin seleccionar
              </p>
            )}
          </div>
        </div>

        {paqueteSel && (
          <div className="flex items-start gap-2.5">
            <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Paquete
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {paqueteSel.nombre}
              </p>
              {paqueteSel.precio > 0 && (
                <p className="text-xs text-brand-azul font-bold">
                  {formatCurrency(paqueteSel.precio)}
                </p>
              )}
            </div>
          </div>
        )}

        {watchValues.nombreNino && (
          <div className="flex items-start gap-2.5">
            <PartyPopper className="h-4 w-4 text-brand-rosa shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Cumpleañero
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {watchValues.nombreNino}
                {watchValues.edadCumple !== undefined &&
                  ` · ${watchValues.edadCumple} años`}
              </p>
            </div>
          </div>
        )}

        {watchValues.aforoDeclarado && (
          <div className="flex items-start gap-2.5">
            <Users className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Aforo estimado
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {watchValues.aforoDeclarado} personas
              </p>
            </div>
          </div>
        )}

        {watchValues.origenContacto && (
          <div className="flex items-start gap-2.5">
            <Radio className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Canal
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {
                  ORIGENES_CONTACTO.find(
                    (o) => o.value === watchValues.origenContacto
                  )?.label
                }
              </p>
            </div>
          </div>
        )}

        {watchValues.presupuestoEstimado !== undefined && (
          <div className="flex items-start gap-2.5">
            <Banknote className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Presupuesto estimado
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(watchValues.presupuestoEstimado)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1">
        {listoParaCrear ? (
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">Listo para crear</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold">
                Faltan datos obligatorios
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 pl-5.5">
              {camposFaltantes.join(', ')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
