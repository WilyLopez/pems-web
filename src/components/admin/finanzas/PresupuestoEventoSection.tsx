'use client'

import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { usePresupuestosEvento, usePresupuestoMutations } from '@/hooks/useFinanzas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { EstadoPresupuesto } from '@/types/finanzas.types'

const estadoBadge: Record<EstadoPresupuesto, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  APROBADO:  'bg-brand-azul/10 text-brand-azul',
  EJECUTADO: 'bg-emerald-100 text-emerald-700',
}

const schemaNuevo = z.object({
  concepto:       z.string().min(2, 'El concepto es obligatorio'),
  categoria:      z.string().min(1, 'La categoría es obligatoria'),
  montoEstimado:  z.coerce.number().positive('Debe ser mayor a 0'),
})
const schemaEjecutar = z.object({
  montoReal: z.coerce.number().positive('Debe ser mayor a 0'),
})
type NuevoForm    = z.infer<typeof schemaNuevo>
type EjecutarForm = z.infer<typeof schemaEjecutar>

interface Props {
  idEvento: number
}

export function PresupuestoEventoSection({ idEvento }: Props) {
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [ejecutandoId, setEjecutandoId] = useState<number | null>(null)

  const { data: items = [], isLoading } = usePresupuestosEvento(idEvento)
  const { guardar, ejecutar, eliminar } = usePresupuestoMutations()

  const formNuevo    = useForm<NuevoForm>({ resolver: zodResolver(schemaNuevo) })
  const formEjecutar = useForm<EjecutarForm>({ resolver: zodResolver(schemaEjecutar) })

  const totalEstimado = items.reduce((s, i) => s + i.montoEstimado, 0)
  const totalReal     = items.reduce((s, i) => s + (i.montoReal ?? 0), 0)

  function onGuardar(v: NuevoForm) {
    guardar.mutate({ idEvento, payload: v }, {
      onSuccess: () => { formNuevo.reset(); setModalNuevo(false) },
    })
  }
  function onEjecutar(v: EjecutarForm) {
    if (!ejecutandoId) return
    ejecutar.mutate({ id: ejecutandoId, payload: v }, {
      onSuccess: () => { formEjecutar.reset(); setEjecutandoId(null) },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900">Presupuesto del evento</h4>
        <Button size="sm" variant="outline" onClick={() => setModalNuevo(true)} className="gap-1.5 h-7 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-gray-500">
            Estimado: <span className="font-semibold text-gray-800">{formatCurrency(totalEstimado)}</span>
          </span>
          <span className="text-gray-500">
            Real: <span className="font-semibold text-emerald-700">{formatCurrency(totalReal)}</span>
          </span>
          {totalEstimado > 0 && (
            <span className={cn('font-semibold', totalReal > totalEstimado ? 'text-red-500' : 'text-brand-azul')}>
              {totalReal > totalEstimado ? '+' : ''}{formatCurrency(totalReal - totalEstimado)}
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">Sin ítems de presupuesto.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.concepto}</p>
                <p className="text-xs text-gray-400">{item.categoria}</p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-xs text-gray-500">Est. {formatCurrency(item.montoEstimado)}</p>
                {item.montoReal != null && (
                  <p className="text-xs font-semibold text-emerald-600">Real {formatCurrency(item.montoReal)}</p>
                )}
              </div>
              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', estadoBadge[item.estado])}>
                {item.estado}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {item.estado !== 'EJECUTADO' && (
                  <button
                    type="button"
                    onClick={() => { setEjecutandoId(item.id); formEjecutar.setValue('montoReal', item.montoEstimado) }}
                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                    title="Marcar como ejecutado"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => eliminar.mutate(item.id)}
                  disabled={eliminar.isPending}
                  className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Agregar ítem de presupuesto</DialogTitle></DialogHeader>
          <form onSubmit={formNuevo.handleSubmit(onGuardar)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Concepto</Label>
              <Input {...formNuevo.register('concepto')} placeholder="Ej. Decoración" />
              {formNuevo.formState.errors.concepto && (
                <p className="text-xs text-red-500">{formNuevo.formState.errors.concepto.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Categoría</Label>
              <select {...formNuevo.register('categoria')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                <option value="">Seleccionar…</option>
                <option value="Logística">Logística</option>
                <option value="Decoración">Decoración</option>
                <option value="Catering">Catering</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Personal">Personal</option>
                <option value="Otro">Otro</option>
              </select>
              {formNuevo.formState.errors.categoria && (
                <p className="text-xs text-red-500">{formNuevo.formState.errors.categoria.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Monto estimado (S/)</Label>
              <Input type="number" step="0.01" min="0" {...formNuevo.register('montoEstimado')} />
              {formNuevo.formState.errors.montoEstimado && (
                <p className="text-xs text-red-500">{formNuevo.formState.errors.montoEstimado.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalNuevo(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={guardar.isPending} className="bg-brand-azul hover:bg-brand-azul/90 text-white">Agregar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={ejecutandoId !== null} onOpenChange={(v) => { if (!v) setEjecutandoId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Registrar monto real</DialogTitle></DialogHeader>
          <form onSubmit={formEjecutar.handleSubmit(onEjecutar)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Monto real ejecutado (S/)</Label>
              <Input type="number" step="0.01" min="0" {...formEjecutar.register('montoReal')} />
              {formEjecutar.formState.errors.montoReal && (
                <p className="text-xs text-red-500">{formEjecutar.formState.errors.montoReal.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEjecutandoId(null)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={ejecutar.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">Confirmar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
