'use client'

import { useEffect, useMemo, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  useCrearContenidoLegal,
  useTiposLegal,
} from '@/features/admin/cms/legal/hooks/useContenidoLegal'

const schema = z.object({
  codigo: z.string().min(1, 'Selecciona un tipo de documento'),
  titulo: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(200, 'Máximo 200 caracteres'),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onCreado?: (tipo: string) => void
}

export function LegalNuevoDocumentoModal({ open, onClose, onCreado }: Props) {
  const crear = useCrearContenidoLegal()
  const { data: tipos, isLoading } = useTiposLegal()

  const disponibles = useMemo(
    () => (tipos ?? []).filter((t) => !t.yaCreado),
    [tipos]
  )

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: '', titulo: '' },
  })

  const codigoSeleccionado = watch('codigo')
  const [tituloEditado, setTituloEditado] = useState(false)

  useEffect(() => {
    if (!open) {
      reset()
      setTituloEditado(false)
    }
  }, [open, reset])

  useEffect(() => {
    if (!codigoSeleccionado || tituloEditado) return
    const tipo = disponibles.find((t) => t.codigo === codigoSeleccionado)
    if (tipo) setValue('titulo', tipo.etiqueta)
  }, [codigoSeleccionado, disponibles, tituloEditado, setValue])

  function onSubmit(values: FormValues) {
    crear.mutate(
      { tipo: values.codigo, titulo: values.titulo, contenido: '' },
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

        {!isLoading && disponibles.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Todos los tipos de documento legal ya fueron creados.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="nuevo-codigo">Tipo de documento *</Label>
              <Select
                value={codigoSeleccionado}
                onValueChange={(v) =>
                  setValue('codigo', v, { shouldValidate: true })
                }
              >
                <SelectTrigger id="nuevo-codigo" className="mt-1">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {disponibles.map((t) => (
                    <SelectItem key={t.codigo} value={t.codigo}>
                      {t.etiqueta}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.codigo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.codigo.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nuevo-titulo">Título del documento *</Label>
              <Input
                id="nuevo-titulo"
                {...register('titulo')}
                onChange={(e) => {
                  setTituloEditado(true)
                  register('titulo').onChange(e)
                }}
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
                disabled={crear.isPending}
                className="bg-brand-azul text-white"
              >
                {crear.isPending ? 'Creando...' : 'Crear documento'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
