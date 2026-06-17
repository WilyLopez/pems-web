'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useCrearContenidoLegal } from '@/hooks/useContenidoLegal'

const schema = z.object({
  nombre: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(80, 'Máximo 80 caracteres'),
  titulo: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(200, 'Máximo 200 caracteres'),
})

type FormValues = z.infer<typeof schema>

function generarIdentificador(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 30)
}

interface Props {
  open: boolean
  onClose: () => void
  onCreado?: (tipo: string) => void
}

export function LegalNuevoDocumentoModal({ open, onClose, onCreado }: Props) {
  const crear = useCrearContenidoLegal()
  const [identificador, setIdentificador] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', titulo: '' },
  })

  const nombreWatch = watch('nombre')

  useEffect(() => {
    setIdentificador(generarIdentificador(nombreWatch ?? ''))
  }, [nombreWatch])

  useEffect(() => {
    if (!open) {
      reset()
      setIdentificador('')
    }
  }, [open, reset])

  function onSubmit(values: FormValues) {
    if (!identificador) return
    crear.mutate(
      { tipo: identificador, titulo: values.titulo, contenido: '' },
      {
        onSuccess: (data) => {
          onCreado?.(data.tipo)
          onClose()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-brand-azul" />
            Nuevo documento legal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="nuevo-nombre">Nombre del tipo de documento *</Label>
            <Input
              id="nuevo-nombre"
              {...register('nombre')}
              className="mt-1"
              placeholder="Ej: Aviso de Cookies"
              autoFocus
            />
            {errors.nombre && (
              <p className="text-xs text-destructive mt-1">
                {errors.nombre.message}
              </p>
            )}
            {identificador && (
              <p className="text-xs text-muted-foreground mt-1">
                Identificador:{' '}
                <code className="bg-muted px-1 rounded">{identificador}</code>
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="nuevo-titulo">Título del documento *</Label>
            <Input
              id="nuevo-titulo"
              {...register('titulo')}
              className="mt-1"
              placeholder="Ej: Política de Cookies"
            />
            {errors.titulo && (
              <p className="text-xs text-destructive mt-1">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={crear.isPending || !identificador}
              className="bg-brand-azul text-white"
            >
              {crear.isPending ? 'Creando...' : 'Crear documento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
