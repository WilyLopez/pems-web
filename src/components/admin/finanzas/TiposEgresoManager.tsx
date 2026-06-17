'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { CategoriaEgreso } from '@/types/finanzas.types'
import { useTiposEgreso, useTipoEgresoMutations } from '@/hooks/useFinanzas'
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

const schema = z.object({
  codigo: z.string().min(2, 'El código es obligatorio').max(50),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.enum(['RECURRENTE_FIJO', 'RECURRENTE_VARIABLE', 'EVENTUAL']),
})

type FormValues = z.infer<typeof schema>

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
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { data: tipos = [], isLoading } = useTiposEgreso()
  const { crear, desactivar } = useTipoEgresoMutations()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: '', nombre: '', descripcion: '', categoria: 'EVENTUAL' },
  })

  function onSubmit(data: FormValues) {
    crear.mutate(data, { onSuccess: () => { reset(); setOpen(false) } })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Tipos de egreso</h3>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 font-semibold">Nombre</th>
                <th className="pb-2 font-semibold">Categoria</th>
                <th className="pb-2 font-semibold">Estado</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tipos.map((t) => (
                <tr key={t.codigo} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-900">{t.nombre}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                        categoriaBadge[t.categoria]
                      )}
                    >
                      {categoriaLabel[t.categoria]}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-1.5 py-0.5 rounded-full',
                        t.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      )}
                    >
                      {t.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {t.activo && (
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo tipo de egreso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="codigoEgreso">Código *</Label>
              <Input id="codigoEgreso" placeholder="Ej: AGUA_LUZ" className="font-mono" {...register('codigo')} />
              {errors.codigo && (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" placeholder="Ej: Agua y luz" {...register('nombre')} />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcionTipo">Descripcion</Label>
              <Input
                id="descripcionTipo"
                placeholder="Descripcion opcional"
                {...register('descripcion')}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select
                defaultValue="EVENTUAL"
                onValueChange={(v) => setValue('categoria', v as CategoriaEgreso)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECURRENTE_FIJO">Recurrente fijo</SelectItem>
                  <SelectItem value="RECURRENTE_VARIABLE">Recurrente variable</SelectItem>
                  <SelectItem value="EVENTUAL">Eventual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => { reset(); setOpen(false) }}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={crear.isPending}
                className="bg-brand-azul hover:bg-brand-azul/90 text-white"
              >
                {crear.isPending ? 'Guardando...' : 'Crear'}
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
            Los egresos existentes no se veran afectados. No podras registrar nuevos egresos
            con este tipo.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={desactivar.isPending}
              onClick={() => {
                if (confirmId !== null) {
                  desactivar.mutate(confirmId, { onSuccess: () => setConfirmId(null) })
                }
              }}
            >
              {desactivar.isPending ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
