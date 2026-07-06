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
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ContenidoWeb } from '@/types/cms.types'
import { Bloque, MAX_LONGITUD_REGLA, parseTextos } from '../config/bloques'
import { PREVIEWS } from './previews'
import { CambioBloque, useGuardarBloque } from '../hooks/useContenidoBloques'

interface FormValues {
  titulo: string
  subtitulo: string
  items: { valor: string }[]
}

interface BloqueReglasEditorDialogProps {
  bloque: Bloque
  mapa: Map<string, ContenidoWeb>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BloqueReglasEditorDialog({
  bloque,
  mapa,
  open,
  onOpenChange,
}: BloqueReglasEditorDialogProps) {
  const { guardar, guardando } = useGuardarBloque()
  const Preview = PREVIEWS[bloque.preview]
  const maxItem = bloque.maxItem ?? MAX_LONGITUD_REGLA

  const itemTitulo = mapa.get(bloque.claveTitulo ?? '')
  const itemSubtitulo = mapa.get(bloque.claveSubtitulo ?? '')
  const itemLista = mapa.get(bloque.claveItems ?? '')

  const defaultValues = useMemo<FormValues>(
    () => ({
      titulo: itemTitulo?.valorEs ?? '',
      subtitulo: itemSubtitulo?.valorEs ?? '',
      items: parseTextos(itemLista?.valorEs).map((valor) => ({ valor })),
    }),
    [itemTitulo, itemSubtitulo, itemLista]
  )

  const { register, handleSubmit, watch, reset, control } = useForm<FormValues>(
    { defaultValues }
  )
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const observados = watch()
  const itemsTexto = (observados.items ?? [])
    .map((i) => i.valor ?? '')
    .filter((v) => v.trim().length > 0)
  const valores: Record<string, string> = {
    [bloque.claveTitulo ?? '']: observados.titulo ?? '',
    [bloque.claveSubtitulo ?? '']: observados.subtitulo ?? '',
    [bloque.claveItems ?? '']: JSON.stringify(itemsTexto),
  }

  async function onSubmit(data: FormValues) {
    const cambios: CambioBloque[] = []
    if (itemTitulo && data.titulo !== (itemTitulo.valorEs ?? '')) {
      cambios.push({ id: itemTitulo.id, valorEs: data.titulo })
    }
    if (itemSubtitulo && data.subtitulo !== (itemSubtitulo.valorEs ?? '')) {
      cambios.push({ id: itemSubtitulo.id, valorEs: data.subtitulo })
    }
    if (itemLista) {
      const nuevos = (data.items ?? [])
        .map((i) => i.valor.trim())
        .filter((v) => v.length > 0)
      const nuevoJson = JSON.stringify(nuevos)
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
                <Label htmlFor="reglamento-titulo">Título</Label>
                <Input id="reglamento-titulo" {...register('titulo')} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="reglamento-subtitulo">Subtítulo</Label>
                <Input id="reglamento-subtitulo" {...register('subtitulo')} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Normas</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => append({ valor: '' })}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar norma
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aún no hay normas. Agrega la primera.
                  </p>
                )}

                {fields.map((field, i) => (
                  <div key={field.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder={`Norma ${i + 1}`}
                        maxLength={maxItem}
                        {...register(`items.${i}.valor`)}
                      />
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="Eliminar norma"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-right text-[11px] text-muted-foreground">
                      {observados.items?.[i]?.valor?.length ?? 0}/{maxItem}
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
