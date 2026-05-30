'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTiposIngreso, useTipoIngresoMutations } from '@/hooks/useFinanzas'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'
import { CategoriaIngreso } from '@/types/finanzas.types'

const categoriaOpciones: { value: CategoriaIngreso; label: string }[] = [
  { value: 'RESERVA_PUBLICA', label: 'Reserva pública' },
  { value: 'ADELANTO_EVENTO', label: 'Adelanto de evento' },
  { value: 'INGRESO_MANUAL',  label: 'Ingreso manual'   },
  { value: 'OTRO',            label: 'Otro'              },
]

const categoriaBadge: Record<CategoriaIngreso, string> = {
  RESERVA_PUBLICA: 'bg-emerald-100 text-emerald-700',
  ADELANTO_EVENTO: 'bg-brand-azul/10 text-brand-azul',
  INGRESO_MANUAL:  'bg-gray-100 text-gray-600',
  OTRO:            'bg-yellow-100 text-yellow-700',
}

const schema = z.object({
  nombre:      z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().optional(),
  categoria:   z.enum(['RESERVA_PUBLICA', 'ADELANTO_EVENTO', 'INGRESO_MANUAL', 'OTRO'], {
    required_error: 'Selecciona una categoría',
  }),
})
type FormValues = z.infer<typeof schema>

export default function TiposIngresoPage() {
  const [openModal, setModal] = useState(false)

  const { data: tipos = [], isLoading }  = useTiposIngreso()
  const { crear, desactivar }            = useTipoIngresoMutations()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function onSubmit(values: FormValues) {
    crear.mutate(values, { onSuccess: () => { reset(); setModal(false) } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PageHeader title="Tipos de ingreso" description="Categorías utilizadas para clasificar los ingresos de la sede" />
        <Button size="sm" onClick={() => setModal(true)} className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white">
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Descripción</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : tipos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-400">
                    Sin tipos de ingreso registrados.
                  </td>
                </tr>
              ) : tipos.map((t) => (
                <tr key={t.id} className={cn('hover:bg-gray-50 transition-colors', !t.activo && 'opacity-50')}>
                  <td className="px-4 py-3 font-medium text-gray-900">{t.nombre}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[260px] truncate">{t.descripcion ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[11px] font-semibold px-1.5 py-0.5 rounded-full', categoriaBadge[t.categoria])}>
                      {categoriaOpciones.find((o) => o.value === t.categoria)?.label ?? t.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                      t.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    )}>
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.activo && (
                      <button
                        type="button"
                        onClick={() => desactivar.mutate(t.id)}
                        disabled={desactivar.isPending}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openModal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo tipo de ingreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input {...register('nombre')} placeholder="Ej. Venta de merchandising" />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Categoría</Label>
              <select {...register('categoria')} className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-azul">
                <option value="">Seleccionar…</option>
                {categoriaOpciones.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.categoria && <p className="text-xs text-red-500">{errors.categoria.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Descripción (opcional)</Label>
              <Input {...register('descripcion')} placeholder="Descripción breve…" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setModal(false)}>Cancelar</Button>
              <Button type="submit" size="sm" disabled={crear.isPending} className="bg-brand-azul hover:bg-brand-azul/90 text-white">
                Crear
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
