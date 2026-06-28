'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Trash2, Plus } from 'lucide-react'
import {
  useGastosOperativos,
  useGastoOperativoMutations,
} from '../hooks/useFinanceData'
import { gastoOperativoSchema } from '../schemas/finance.schemas'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

type FormValues = z.infer<typeof gastoOperativoSchema>

interface Props {
  idSede: number
  fecha: string
}

export function GastosOperativosDia({ idSede, fecha }: Props) {
  const [showForm, setShowForm] = useState(false)
  const { data: gastos = [], isLoading } = useGastosOperativos(idSede, fecha)
  const { registrar, eliminar } = useGastoOperativoMutations()

  const total = gastos.reduce((acc, g) => acc + g.monto, 0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(gastoOperativoSchema) })

  function onSubmit(data: FormValues) {
    registrar.mutate(
      {
        idSede,
        payload: {
          fecha,
          descripcion: data.descripcion,
          monto: data.monto,
          comprobanteUrl: data.comprobanteUrl || undefined,
        },
      },
      {
        onSuccess: () => {
          reset()
          setShowForm(false)
        },
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total gastos operativos</p>
          <p className="text-lg font-black text-red-600">
            {formatCurrency(total)}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((v) => !v)}
          className="h-7 text-xs gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 rounded-xl p-4 space-y-3 border"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="descripcionOp">Descripcion *</Label>
              <Input
                id="descripcionOp"
                placeholder="Ej: Limpieza, suministros"
                {...register('descripcion')}
              />
              {errors.descripcion && (
                <p className="text-xs text-destructive">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="montoOp">Monto *</Label>
              <Input
                id="montoOp"
                type="number"
                step="0.01"
                min="0"
                {...register('monto')}
              />
              {errors.monto && (
                <p className="text-xs text-destructive">
                  {errors.monto.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comprobanteOpUrl">Comprobante / Referencia</Label>
            <Input
              id="comprobanteOpUrl"
              placeholder="Ej: Boleta N° 001-0042, factura, foto..."
              {...register('comprobanteUrl')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                reset()
                setShowForm(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={registrar.isPending}
              className="bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {registrar.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : gastos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-3">
          Sin gastos para este dia.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {gastos.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between py-2.5 gap-2"
            >
              <p className="text-sm text-gray-800 truncate flex-1">
                {g.descripcion}
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(g.monto)}
                </span>
                <button
                  type="button"
                  onClick={() => eliminar.mutate(g.id)}
                  disabled={eliminar.isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
