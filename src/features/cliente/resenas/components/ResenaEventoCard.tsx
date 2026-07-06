'use client'

import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { CheckCircle2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useEnviarResena } from '../hooks/useEnviarResena'
import {
  resenaEventoSchema,
  ResenaEventoFormValues,
} from '../schemas/resena.schema'

interface ResenaEventoCardProps {
  idEvento: number
  estado: string
}

export function ResenaEventoCard({ idEvento, estado }: ResenaEventoCardProps) {
  const { nombre } = useAuth()
  const enviar = useEnviarResena()
  const [enviada, setEnviada] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResenaEventoFormValues>({
    resolver: zodResolver(resenaEventoSchema),
    defaultValues: {
      nombreAutor: nombre ?? '',
      calificacion: 0,
      contenido: '',
    },
  })

  if (estado !== 'COMPLETADA') return null

  function onSubmit(values: ResenaEventoFormValues) {
    enviar.mutate(
      { idEventoPrivado: idEvento, ...values },
      { onSuccess: () => setEnviada(true) }
    )
  }

  if (enviada) {
    return (
      <Card className="border border-green-200 bg-green-50 rounded-2xl">
        <CardContent className="flex items-center gap-3 p-5">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">
              Gracias por tu opinión
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              La revisaremos y se publicará pronto en nuestro sitio.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-brand-rosa/20 rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-rosa/10 flex items-center justify-center">
            <Star className="h-4 w-4 text-brand-rosa" />
          </div>
          Cuéntanos tu experiencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Calificación</Label>
            <Controller
              control={control}
              name="calificacion"
              render={({ field }) => (
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => field.onChange(valor)}
                      aria-label={`${valor} estrella${valor > 1 ? 's' : ''}`}
                      aria-pressed={field.value >= valor}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          field.value >= valor
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.calificacion && (
              <p className="mt-1 text-xs text-destructive">
                {errors.calificacion.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="nombreAutor">Tu nombre</Label>
            <Input
              id="nombreAutor"
              {...register('nombreAutor')}
              className="mt-1"
              placeholder="Nombre que se mostrará"
            />
            {errors.nombreAutor && (
              <p className="mt-1 text-xs text-destructive">
                {errors.nombreAutor.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="contenido">Tu opinión</Label>
            <Textarea
              id="contenido"
              rows={4}
              {...register('contenido')}
              className="mt-1 resize-none"
              placeholder="¿Cómo fue tu celebración en Kiki y Lala?"
            />
            {errors.contenido && (
              <p className="mt-1 text-xs text-destructive">
                {errors.contenido.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={enviar.isPending}
              className="bg-brand-rosa text-white"
            >
              {enviar.isPending ? 'Enviando...' : 'Enviar opinión'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
