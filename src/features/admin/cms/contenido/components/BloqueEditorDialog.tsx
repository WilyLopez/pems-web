'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
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
import { Bloque, nombreCampo } from '../config/bloques'
import { PREVIEWS } from './previews'
import { CambioBloque, useGuardarBloque } from '../hooks/useContenidoBloques'

interface BloqueEditorDialogProps {
  bloque: Bloque
  mapa: Map<string, ContenidoWeb>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BloqueEditorDialog({
  bloque,
  mapa,
  open,
  onOpenChange,
}: BloqueEditorDialogProps) {
  const { guardar, guardando } = useGuardarBloque()
  const Preview = PREVIEWS[bloque.preview]
  const campos = bloque.campos ?? []

  const defaultValues = useMemo(() => {
    const dv: Record<string, string> = {}
    for (const campo of campos) {
      dv[nombreCampo(campo.clave)] = mapa.get(campo.clave)?.valorEs ?? ''
    }
    return dv
  }, [bloque, mapa])

  const { register, handleSubmit, watch, reset } = useForm<
    Record<string, string>
  >({ defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const observados = watch()
  const valores: Record<string, string> = {}
  for (const campo of campos) {
    valores[campo.clave] = observados[nombreCampo(campo.clave)] ?? ''
  }

  async function onSubmit(data: Record<string, string>) {
    const cambios: CambioBloque[] = []
    for (const campo of campos) {
      const item = mapa.get(campo.clave)
      const nuevo = data[nombreCampo(campo.clave)] ?? ''
      if (item && nuevo !== (item.valorEs ?? '')) {
        cambios.push({ id: item.id, valorEs: nuevo })
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
              {campos.map((campo) => (
                <div key={campo.clave} className="space-y-1">
                  <Label htmlFor={nombreCampo(campo.clave)}>
                    {campo.label}
                  </Label>
                  {campo.multilinea ? (
                    <Textarea
                      id={nombreCampo(campo.clave)}
                      rows={3}
                      {...register(nombreCampo(campo.clave))}
                      className="resize-y"
                    />
                  ) : (
                    <Input
                      id={nombreCampo(campo.clave)}
                      {...register(nombreCampo(campo.clave))}
                    />
                  )}
                </div>
              ))}
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
