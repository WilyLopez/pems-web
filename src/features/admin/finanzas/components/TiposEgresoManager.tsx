'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, X, Search } from 'lucide-react'
import { CategoriaEgreso } from '../types'
import { useTiposEgreso, useTipoEgresoMutations } from '../hooks/useFinanceData'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

const crearSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
  categoria: z.enum(['RECURRENTE_FIJO', 'RECURRENTE_VARIABLE', 'EVENTUAL']),
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

const categoriaBadge: Record<CategoriaEgreso, string> = {
  RECURRENTE_FIJO: 'bg-blue-100 text-blue-700',
  RECURRENTE_VARIABLE: 'bg-yellow-100 text-yellow-700',
  EVENTUAL: 'bg-gray-100 text-gray-600',
}

const categoriaLabel: Record<CategoriaEgreso, string> = {
  RECURRENTE_FIJO: 'Fijo',
  RECURRENTE_VARIABLE: 'Variable',
  EVENTUAL: 'Eventual',
}

export function TiposEgresoManager() {
  const [openCrear, setOpenCrear] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')

  const { data: tipos = [], isLoading } = useTiposEgreso()
  const { crear, desactivar } = useTipoEgresoMutations()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(crearSchema),
    defaultValues: { nombre: '', descripcion: '', categoria: 'EVENTUAL' },
  })

  const tiposFiltrados = busqueda.trim()
    ? tipos.filter((t) =>
        t.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : tipos

  const activos = tipos.filter((t) => t.activo).length
  const inactivos = tipos.length - activos

  function onSubmit(data: FormValues) {
    crear.mutate(
      {
        codigo: generarCodigo(data.nombre),
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
      },
      {
        onSuccess: () => {
          reset()
          setOpenCrear(false)
        },
      }
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
              <th className="px-4 py-2.5 font-semibold">Categoría</th>
              <th className="px-4 py-2.5 font-semibold">Estado</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3.5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tiposFiltrados.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  {busqueda
                    ? 'Sin resultados para esa búsqueda.'
                    : 'Sin tipos registrados.'}
                </td>
              </tr>
            ) : (
              tiposFiltrados.map((t) => (
                <tr
                  key={t.codigo}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    !t.activo && 'opacity-50'
                  )}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {t.nombre}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                        categoriaBadge[t.categoria]
                      )}
                    >
                      {categoriaLabel[t.categoria]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                        t.activo
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {t.activo && !t.esSistema && (
                      <button
                        type="button"
                        onClick={() => setConfirmId(t.codigo)}
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo tipo de egreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Agua y luz"
                autoFocus
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Categoría</Label>
              <Select
                defaultValue="EVENTUAL"
                onValueChange={(v) =>
                  setValue('categoria', v as CategoriaEgreso)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECURRENTE_FIJO">
                    Recurrente fijo
                  </SelectItem>
                  <SelectItem value="RECURRENTE_VARIABLE">
                    Recurrente variable
                  </SelectItem>
                  <SelectItem value="EVENTUAL">Eventual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>
                Descripción{' '}
                <span className="text-gray-400 font-normal">(opcional)</span>
              </Label>
              <Input
                placeholder="Descripción breve…"
                {...register('descripcion')}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  reset()
                  setOpenCrear(false)
                }}
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

      <Dialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Desactivar tipo de egreso</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            Los egresos existentes no se verán afectados. No podrás registrar
            nuevos egresos con este tipo.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={desactivar.isPending}
              onClick={() => {
                if (confirmId !== null) {
                  desactivar.mutate(confirmId, {
                    onSuccess: () => setConfirmId(null),
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
