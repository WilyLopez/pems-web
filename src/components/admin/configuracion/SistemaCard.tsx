'use client'

import { useEffect, useState } from 'react'
import { Settings, Eye, Pencil, AlertTriangle, Loader2, Save } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'
import {
  useConfiguracionAdmin,
  useActualizarConfiguracion,
} from '@/hooks/useConfiguracionPublica'

const schema = z.object({
  mantenimientoActivo:   z.boolean(),
  mensajeMantenimiento: z.string().max(500).optional(),
})
type FormValues = z.infer<typeof schema>

function SistemaEditForm() {
  const { data: config }  = useConfiguracionAdmin()
  const actualizar        = useActualizarConfiguracion()

  const { control, register, handleSubmit, watch, reset, formState: { isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mantenimientoActivo: false, mensajeMantenimiento: '' },
  })

  useEffect(() => {
    if (config) {
      reset({
        mantenimientoActivo:  config.mantenimientoActivo,
        mensajeMantenimiento: config.mensajeMantenimiento ?? '',
      })
    }
  }, [config, reset])

  const activo = watch('mantenimientoActivo')

  function onSubmit(values: FormValues) {
    if (!config) return
    actualizar.mutate({
      ...config,
      mantenimientoActivo:  values.mantenimientoActivo,
      mensajeMantenimiento: values.mensajeMantenimiento,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      <div className={cn(
        'flex items-start gap-3 p-4 rounded-xl border',
        activo ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50/50'
      )}>
        <AlertTriangle className={cn('h-4 w-4 shrink-0 mt-0.5', activo ? 'text-amber-500' : 'text-gray-400')} />
        <div>
          <p className={cn('text-sm font-medium', activo ? 'text-amber-800' : 'text-gray-700')}>
            Modo mantenimiento
          </p>
          <p className={cn('text-xs mt-0.5', activo ? 'text-amber-700' : 'text-muted-foreground')}>
            {activo
              ? 'El sitio está en mantenimiento. Solo los administradores tienen acceso.'
              : 'El sitio está activo y visible para todos los visitantes.'}
          </p>
        </div>
        <Controller name="mantenimientoActivo" control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className={field.value ? 'data-[state=checked]:bg-amber-500 ml-auto' : 'ml-auto'}
            />
          )}
        />
      </div>

      {activo && (
        <div className="space-y-1.5">
          <Label htmlFor="mensajeMantenimiento">Mensaje para los visitantes</Label>
          <Textarea
            id="mensajeMantenimiento"
            {...register('mensajeMantenimiento')}
            rows={3}
            className="resize-none"
            placeholder="Estamos mejorando el sitio para ti. Volvemos pronto..."
          />
          <p className="text-xs text-muted-foreground">
            Visible para todos los visitantes mientras el modo esté activo.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <Button type="submit" disabled={actualizar.isPending || !isDirty} size="sm">
          {actualizar.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Guardar cambios</>
          )}
        </Button>
      </div>
    </form>
  )
}

export function SistemaCard() {
  const [modal, setModal] = useState<'view' | 'edit' | null>(null)
  const { data: config }  = useConfiguracionAdmin()

  const activo = config?.mantenimientoActivo ?? false

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
          <Settings className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">Sistema / Mantenimiento</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            Modo mantenimiento del sitio web público
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 border-t border-gray-50 pt-3">
        <li className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">Estado</span>
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            activo ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          )}>
            {activo ? 'En mantenimiento' : 'Sitio activo'}
          </span>
        </li>
        {activo && config?.mensajeMantenimiento && (
          <li className="flex items-start justify-between gap-2">
            <span className="text-xs text-gray-500 shrink-0">Mensaje</span>
            <span className="text-xs font-medium text-gray-800 text-right line-clamp-2">
              {config.mensajeMantenimiento}
            </span>
          </li>
        )}
      </ul>

      <div className="flex gap-2 mt-auto">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setModal('view')}>
          <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver
        </Button>
        <Button size="sm" className="flex-1 bg-brand-azul hover:bg-brand-azul/90 text-white" onClick={() => setModal('edit')}>
          <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
        </Button>
      </div>

      <Dialog open={modal === 'view'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Sistema / Mantenimiento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
              <span className="text-sm text-gray-600">Modo mantenimiento</span>
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                activo ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              )}>
                {activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {config?.mensajeMantenimiento && (
              <div className="p-3 rounded-lg bg-gray-50 border space-y-1">
                <p className="text-xs text-muted-foreground">Mensaje</p>
                <p className="text-sm text-gray-800">{config.mensajeMantenimiento}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal === 'edit'} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Editar: Sistema / Mantenimiento
            </DialogTitle>
          </DialogHeader>
          <SistemaEditForm />
        </DialogContent>
      </Dialog>
    </div>
  )
}
