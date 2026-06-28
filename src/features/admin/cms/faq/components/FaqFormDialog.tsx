'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { faqSchema, FaqFormValues } from '../schemas/faq.schema'
import { Faq, CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'

interface FaqFormDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  faq: Faq | null
  onSubmit: (payload: CrearFaqPayload | ActualizarFaqPayload) => void
  isLoading: boolean
}

export function FaqFormDialog({
  open,
  onOpenChange,
  faq,
  onSubmit,
  isLoading,
}: FaqFormDialogProps) {
  const isEditing = !!faq
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      pregunta: faq?.pregunta ?? '',
      respuesta: faq?.respuesta ?? '',
      visible: faq?.visible ?? true,
    },
  })

  function handleOpen(v: boolean) {
    if (!v) reset()
    onOpenChange(v)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? 'Editar Pregunta Frecuente'
              : 'Nueva Pregunta Frecuente'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => onSubmit(data))}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="pregunta">Pregunta *</Label>
            <Input
              id="pregunta"
              {...register('pregunta')}
              className="mt-1"
              placeholder="¿Cómo puedo reservar?"
            />
            {errors.pregunta && (
              <p className="text-xs text-destructive mt-1">
                {errors.pregunta.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="respuesta">Respuesta *</Label>
            <Textarea
              id="respuesta"
              rows={5}
              {...register('respuesta')}
              className="mt-1 resize-none"
              placeholder="Puedes reservar ingresando a..."
            />
            {errors.respuesta && (
              <p className="text-xs text-destructive mt-1">
                {errors.respuesta.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              {...register('visible')}
              className="w-4 h-4 rounded"
            />
            <Label htmlFor="visible" className="cursor-pointer">
              Visible en el sitio público
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-brand-azul text-white"
            >
              {isLoading
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear Pregunta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
