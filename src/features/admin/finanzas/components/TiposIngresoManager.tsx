'use client'

import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { useTiposIngreso, useTipoIngresoMutations } from '../hooks/useFinanceData'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'

const crearSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
})
type FormValues = z.infer<typeof crearSchema>

function generarCodigo(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
}

export function TiposIngresoManager() {
  const [openCrear, setOpenCrear] = useState(false)
  const [confirmCodigo, setConfirmCodigo] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const { data: tipos = [], isLoading } = useTiposIngreso()
  const { crear, desactivar } = useTipoIngresoMutations()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: { nombre: '', descripcion: '' },
  })

  const tiposFiltrados = busqueda.trim()
    ? tipos.filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : tipos

  const activos = tipos.filter((t) => t.activo).length
  const inactivos = tipos.length - activos

  function onSubmit(values: FormValues) {
    crear.mutate(
      { codigo: generarCodigo(values.nombre), nombre: values.nombre, descripcion: values.descripcion },
      { onSuccess: () => { reset(); setOpenCrear(false) } }
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {activos} activos
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
            {inactivos} inactivos
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => setOpenCrear(true)}
          className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <Input
          placeholder="Buscar por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-2.5 font-semibold">Nombre</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 3 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tiposFiltrados.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-sm text-gray-400">
                  {busqueda ? 'Sin resultados para esa búsqueda.' : 'Sin tipos registrados.'}
                </td>
              </tr>
            ) : (
              tiposFiltrados.map((t) => (
                <tr
                  key={t.codigo}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    !t.activo && 'opacity-50',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{t.nombre}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                      t.activo
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500',
                    )}>
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.activo && !t.esSistema && (
                      <button
                        type="button"
                        onClick={() => setConfirmCodigo(t.codigo)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Desactivar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={openCrear} onOpenChange={setOpenCrear}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo tipo de ingreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                {...register('nombre')}
                placeholder="Ej: Venta de merchandising"
                autoFocus
              />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label>
              <Input {...register('descripcion')} placeholder="Descripción breve…" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { reset(); setOpenCrear(false) }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={crear.isPending}
                className="bg-brand-azul hover:bg-brand-azul/90 text-white"
              >
                {crear.isPending ? 'Creando…' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmCodigo !== null} onOpenChange={() => setConfirmCodigo(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Desactivar tipo de ingreso</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Los ingresos existentes no se verán afectados. No podrás registrar nuevos ingresos con este tipo.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmCodigo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={desactivar.isPending}
              onClick={() => {
                if (confirmCodigo) {
                  desactivar.mutate(confirmCodigo, {
                    onSuccess: () => setConfirmCodigo(null),
                  })
                }
              }}
            >
              {desactivar.isPending ? 'Desactivando…' : 'Desactivar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
