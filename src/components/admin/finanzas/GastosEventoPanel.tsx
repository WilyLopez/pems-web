'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Plus } from 'lucide-react'
import { ResumenEventoFinanciero } from '@/types/finanzas.types'
import { useGastosEvento, useGastoEventoMutations } from '@/hooks/useFinanzas'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z.object({
  descripcion: z.string().min(1, 'La descripcion es obligatoria'),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  comprobanteUrl: z.string().url('URL invalida').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  idEvento: number
  resumen: ResumenEventoFinanciero
}

export function GastosEventoPanel({ idEvento, resumen }: Props) {
  const [showForm, setShowForm] = useState(false)
  const { data: gastos = [], isLoading } = useGastosEvento(idEvento)
  const { registrar, eliminar } = useGastoEventoMutations()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormValues) {
    registrar.mutate(
      {
        idEvento,
        payload: {
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

  const metricas = [
    { label: 'Ingreso contrato', value: resumen.ingresoContrato, color: 'text-emerald-700' },
    { label: 'Adelanto recibido', value: resumen.montoAdelanto, color: 'text-blue-700' },
    { label: 'Gastos proveedores', value: resumen.totalGastosProveedores, color: 'text-red-600' },
    { label: 'Gastos adicionales', value: resumen.totalGastosAdicionales, color: 'text-orange-600' },
    { label: 'Utilidad bruta', value: resumen.utilidadBruta, color: resumen.utilidadBruta >= 0 ? 'text-emerald-700' : 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metricas.map(({ label, value, color }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 space-y-0.5">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-base font-black ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">Gastos adicionales</h4>
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
                <Label htmlFor="descripcion">Descripcion *</Label>
                <Input
                  id="descripcion"
                  placeholder="Descripcion del gasto"
                  {...register('descripcion')}
                />
                {errors.descripcion && (
                  <p className="text-xs text-destructive">{errors.descripcion.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('monto')}
                />
                {errors.monto && (
                  <p className="text-xs text-destructive">{errors.monto.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comprobanteUrl">URL comprobante</Label>
              <Input
                id="comprobanteUrl"
                placeholder="https://..."
                {...register('comprobanteUrl')}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { reset(); setShowForm(false) }}
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
          <p className="text-sm text-gray-400 text-center py-4">Sin gastos adicionales.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {gastos.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2.5 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{g.descripcion}</p>
                  <p className="text-xs text-gray-400">{g.fechaCreacion?.split('T')[0]}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-red-600">
                    {formatCurrency(g.monto)}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminar.mutate({ idEvento, idGasto: g.id })}
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
    </div>
  )
}
