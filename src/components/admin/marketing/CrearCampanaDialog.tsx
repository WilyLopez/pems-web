'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'

import { marketingService } from '@/services/marketing.service'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const schema = z.object({
  nombre: z.string().min(2).max(150),
  descripcion: z.string().max(300).optional().or(z.literal('')),
  idPlantillaEmail: z.coerce.number().min(1),
  fechaProgramada: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CrearCampanaDialog({ open, onClose, onCreated }: Props) {
  const { data: plantillas } = useQuery({
    queryKey: ['plantillas'],
    queryFn: () => marketingService.listarPlantillas(0, 100),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const crear = useMutation({
    mutationFn: (values: FormValues) =>
      marketingService.crearCampana({
        nombre: values.nombre,
        descripcion: values.descripcion || undefined,
        idPlantillaEmail: values.idPlantillaEmail,
        fechaProgramada: values.fechaProgramada
          ? new Date(values.fechaProgramada).toISOString()
          : undefined,
      }),
    onSuccess: () => {
      toast.success('Campaña creada.')
      reset()
      onCreated()
      onClose()
    },
    onError: () => toast.error('No se pudo crear la campaña.'),
  })

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Nueva campaña de email</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit((v) => crear.mutate(v))} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input {...register('nombre')} placeholder="Ej: Promo verano 2026" />
              {errors.nombre && (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Input {...register('descripcion')} placeholder="Descripción interna..." />
            </div>

            <div className="space-y-1.5">
              <Label>Plantilla de email *</Label>
              <select
                {...register('idPlantillaEmail')}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul/30"
              >
                <option value="">Seleccionar plantilla...</option>
                {plantillas?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — {p.asunto}
                  </option>
                ))}
              </select>
              {errors.idPlantillaEmail && (
                <p className="text-xs text-red-500">{errors.idPlantillaEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Fecha programada (opcional)</Label>
              <Input type="datetime-local" {...register('fechaProgramada')} />
              <p className="text-[11px] text-gray-400">
                Si no se programa, la campaña quedará como borrador.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" type="button" onClick={onClose} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" disabled={crear.isPending} className="rounded-xl gap-1.5">
                {crear.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Crear campaña
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
