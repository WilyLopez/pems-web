'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { useResponderResena } from '../hooks/useResenas'
import { Resena } from '@/types/resena.types'

const respuestaSchema = z.object({
  respuesta: z.string().min(1, 'La respuesta es obligatoria'),
})
type RespuestaForm = z.infer<typeof respuestaSchema>

interface ResponderDialogProps {
  resena: Resena | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ResponderDialog({
  resena,
  open,
  onOpenChange,
}: ResponderDialogProps) {
  const responder = useResponderResena()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespuestaForm>({
    resolver: zodResolver(respuestaSchema),
    defaultValues: { respuesta: resena?.respuestaAdmin ?? '' },
  })

  function onSubmit(data: RespuestaForm) {
    if (!resena) return
    responder.mutate(
      { id: resena.id, payload: { respuesta: data.respuesta } },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Responder reseña</DialogTitle>
        </DialogHeader>
        {resena && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground italic">
              &quot;{resena.contenido}&quot;
              <p className="mt-1 font-medium text-foreground not-italic">
                — {resena.nombreAutor}
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label>Tu respuesta</Label>
                <Textarea
                  rows={4}
                  placeholder="Escribe tu respuesta como administrador..."
                  {...register('respuesta')}
                  className="mt-1 resize-none"
                />
                {errors.respuesta && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.respuesta.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={responder.isPending}
                  className="bg-brand-azul text-white"
                >
                  {responder.isPending ? 'Guardando...' : 'Guardar respuesta'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
