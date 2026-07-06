'use client'

import { useEffect, useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
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
import { ContenidoWeb } from '@/types/cms.types'
import {
  Bloque,
  MAX_DESCRIPCION_VALOR,
  parseValores,
  ValorItem,
} from '../config/bloques'
import { PREVIEWS } from './previews'
import { CambioBloque, useGuardarBloque } from '../hooks/useContenidoBloques'

interface FormValues {
  titulo: string
  items: ValorItem[]
}

interface BloqueListaEditorDialogProps {
  bloque: Bloque
  mapa: Map<string, ContenidoWeb>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BloqueListaEditorDialog({
  bloque,
  mapa,
  open,
  onOpenChange,
}: BloqueListaEditorDialogProps) {
  const { guardar, guardando } = useGuardarBloque()
  const Preview = PREVIEWS[bloque.preview]
  const maxDesc = bloque.maxDescripcion ?? MAX_DESCRIPCION_VALOR

  const itemTitulo = mapa.get(bloque.claveTitulo ?? '')
  const itemLista = mapa.get(bloque.claveItems ?? '')

  const defaultValues = useMemo<FormValues>(
    () => ({
      titulo: itemTitulo?.valorEs ?? '',
      items: parseValores(itemLista?.valorEs),
    }),
    [itemTitulo, itemLista]
  )

  const { register, handleSubmit, watch, reset, control } = useForm<FormValues>(
    {
      defaultValues,
    }
  )
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const observados = watch()
  const valores: Record<string, string> = {
    [bloque.claveTitulo ?? '']: observados.titulo ?? '',
    [bloque.claveItems ?? '']: JSON.stringify(observados.items ?? []),
  }

  async function onSubmit(data: FormValues) {
    const cambios: CambioBloque[] = []
    if (itemTitulo && data.titulo !== (itemTitulo.valorEs ?? '')) {
      cambios.push({ id: itemTitulo.id, valorEs: data.titulo })
    }
    if (itemLista) {
      const nuevoJson = JSON.stringify(data.items ?? [])
      if (nuevoJson !== (itemLista.valorEs ?? '')) {
        cambios.push({ id: itemLista.id, valorEs: nuevoJson })
      }
    }
    const ok = await guardar(cambios)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bloque.titulo}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="valores-titulo">Título</Label>
                <Input id="valores-titulo" {...register('titulo')} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Valores</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => append({ titulo: '', descripcion: '' })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar valor
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aún no hay valores. Agrega el primero.
                  </p>
                )}

                {fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="space-y-2 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Valor {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="Eliminar valor"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Input
                      placeholder="Título del valor"
                      {...register(`items.${i}.titulo`)}
                    />
                    <Textarea
                      rows={3}
                      maxLength={maxDesc}
                      placeholder="Descripción"
                      className="resize-y"
                      {...register(`items.${i}.descripcion`)}
                    />
                    <p className="text-right text-[11px] text-muted-foreground">
                      {observados.items?.[i]?.descripcion?.length ?? 0}/
                      {maxDesc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vista previa
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                {Preview && <Preview valores={valores} />}
              </div>
              <p className="text-xs text-muted-foreground">
                Así se verá en la página pública.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={guardando}
              className="bg-brand-azul text-white"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
