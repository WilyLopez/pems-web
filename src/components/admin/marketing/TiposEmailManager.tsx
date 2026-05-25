'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle, XCircle, Lock } from 'lucide-react'
import { marketingService } from '@/services/marketing.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'


const schema = z.object({
  codigo: z
    .string()
    .min(1, { message: 'El codigo es obligatorio' })
    .min(2, { message: 'Minimo 2 caracteres' })
    .max(50, { message: 'Maximo 50 caracteres' })
    .regex(/^[A-Z0-9_]+$/, { message: 'Solo mayusculas, numeros y guion bajo (ej: BIENVENIDA)' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es obligatorio' })
    .min(2, { message: 'Minimo 2 caracteres' })
    .max(100, { message: 'Maximo 100 caracteres' }),
  descripcion: z.string().max(255, { message: 'Maximo 255 caracteres' }).optional(),
})

type FormValues = z.infer<typeof schema>

const CODIGOS_PROTEGIDOS = new Set(['BIENVENIDA', 'RECUPERAR_CONTRASENA'])

interface Props {
  showForm?: boolean
}

export function TiposEmailManager({ showForm: defaultShowForm = false }: Props) {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(defaultShowForm)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ['tipos-email'],
    queryFn: marketingService.listarTipos,
  })

  const crear = useMutation({
    mutationFn: marketingService.crearTipo,
    onSuccess: () => {
      toast.success('Tipo de correo creado.')
      qc.invalidateQueries({ queryKey: ['tipos-email'] })
      reset()
      setShowForm(false)
    },
    onError: () => toast.error('No se pudo crear el tipo de correo.'),
  })

  const eliminar = useMutation({
    mutationFn: marketingService.eliminarTipo,
    onSuccess: () => {
      toast.success('Tipo de correo eliminado.')
      qc.invalidateQueries({ queryKey: ['tipos-email'] })
      setConfirmId(null)
    },
    onError: () => toast.error('No se pudo eliminar el tipo de correo.'),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function onSubmit(data: FormValues) {
    crear.mutate({
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {tipos.length} tipo{tipos.length !== 1 ? 's' : ''} registrado{tipos.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          className="gap-1.5 bg-brand-azul hover:bg-brand-azul/90 text-white h-8 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Nuevo tipo
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-50 rounded-xl border p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="codigo" className="text-xs">
                Codigo * <span className="text-gray-400 font-normal">(ej: BIENVENIDA)</span>
              </Label>
              <Input
                id="codigo"
                placeholder="BIENVENIDA"
                className="h-8 text-xs uppercase"
                {...register('codigo')}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                }}
              />
              {errors.codigo && (
                <p className="text-xs text-destructive">{errors.codigo.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs">Nombre *</Label>
              <Input
                id="nombre"
                placeholder="Correo de bienvenida"
                className="h-8 text-xs"
                {...register('nombre')}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descripcion" className="text-xs">Descripcion</Label>
            <Input
              id="descripcion"
              placeholder="Descripcion opcional..."
              className="h-8 text-xs"
              {...register('descripcion')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => { reset(); setShowForm(false) }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={crear.isPending}
              className="h-7 text-xs bg-brand-azul hover:bg-brand-azul/90 text-white"
            >
              {crear.isPending ? 'Guardando...' : 'Crear'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tipos.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Sin tipos de correo registrados.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border overflow-hidden bg-white">
          {tipos.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{t.nombre}</span>
                  <span className="text-[11px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {t.codigo}
                  </span>
                </div>
                {t.descripcion && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{t.descripcion}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {t.activo ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-300" />
                )}
                {CODIGOS_PROTEGIDOS.has(t.codigo) ? (
                  <span
                    title="Este tipo es del sistema y no puede eliminarse"
                    className="text-gray-300 cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                  </span>
                ) : confirmId === t.id ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-[11px] px-2"
                      disabled={eliminar.isPending}
                      onClick={() => eliminar.mutate(t.id)}
                    >
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2"
                      onClick={() => setConfirmId(null)}
                    >
                      No
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(t.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
