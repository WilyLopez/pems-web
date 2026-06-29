'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { Save, Hash, Clock, History } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { ErrorState } from '@/components/common/Errorstate'
import { LegalFormatToolbar } from '@/components/admin/legal/LegalFormatToolbar'
import { LegalPreviewPanel } from '@/components/admin/legal/LegalPreviewPanel'
import { LegalHistorialModal } from '@/components/admin/legal/LegalHistorialModal'
import {
  useContenidoLegalAdmin,
  useActualizarLegal,
} from '../hooks/useContenidoLegal'
import { legalSchema, LegalFormValues } from '../schemas/legal.schema'
import { formatDateTime, cn } from '@/lib/utils'

interface LegalEditorSectionProps {
  tipo: string
}

export function LegalEditorSection({ tipo }: LegalEditorSectionProps) {
  const { data: todos, isLoading, isError, refetch } = useContenidoLegalAdmin()
  const actualizar = useActualizarLegal()
  const [wordCount, setWordCount] = useState(0)
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const doc = todos?.find((d) => d.tipo === tipo)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LegalFormValues>({
    resolver: zodResolver(legalSchema),
    defaultValues: { titulo: '', contenido: '' },
  })

  const { ref: rhfRef, ...registerContenido } = register('contenido')
  const contenidoWatch = watch('contenido')
  const tituloWatch = watch('titulo')

  useEffect(() => {
    setWordCount(contenidoWatch?.split(/\s+/).filter(Boolean).length ?? 0)
  }, [contenidoWatch])

  useEffect(() => {
    if (doc) reset({ titulo: doc.titulo, contenido: doc.contenido })
  }, [doc, reset])

  const handleToolbarChange = useCallback(
    (newValue: string) => {
      setValue('contenido', newValue, {
        shouldDirty: true,
        shouldValidate: false,
      })
    },
    [setValue]
  )

  function onSubmit(data: LegalFormValues) {
    actualizar.mutate({
      tipo,
      payload: { titulo: data.titulo, contenido: data.contenido },
    })
  }

  if (isError) return <ErrorState onRetry={refetch} />

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {doc && (
            <>
              <span className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Versión {doc.version}
              </span>
              {doc.fechaActualizacion && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDateTime(doc.fechaActualizacion)}
                </span>
              )}
              <Badge
                className={cn(
                  'h-5 text-xs',
                  doc.activo
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {doc.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setHistorialAbierto(true)}
            className="gap-1.5 h-8 text-xs font-semibold"
          >
            <History className="h-3.5 w-3.5" />
            Historial
          </Button>
          <Button
            type="submit"
            disabled={actualizar.isPending || !isDirty}
            className="bg-brand-azul text-white gap-1.5 h-8 text-xs font-semibold"
          >
            <Save className="h-3.5 w-3.5" />
            {actualizar.isPending ? 'Guardando...' : 'Guardar versión'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 flex-1 overflow-hidden">
        <div className="flex flex-col overflow-auto border-r">
          <div className="px-6 pt-5 pb-4 space-y-4">
            <div>
              <Label htmlFor={`titulo-${tipo}`}>Título del documento *</Label>
              <Input
                id={`titulo-${tipo}`}
                {...register('titulo')}
                className="mt-1"
                placeholder="Ej: Términos y Condiciones de Uso"
              />
              {errors.titulo && (
                <p className="text-xs text-destructive mt-1">
                  {errors.titulo.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor={`contenido-${tipo}`}>Contenido *</Label>
                <span className="text-xs text-muted-foreground">
                  {wordCount} palabras
                </span>
              </div>
              <LegalFormatToolbar
                textareaRef={
                  textareaRef as React.RefObject<HTMLTextAreaElement>
                }
                onChange={handleToolbarChange}
              />
              <Textarea
                id={`contenido-${tipo}`}
                rows={22}
                {...registerContenido}
                ref={(el) => {
                  rhfRef(el)
                  ;(
                    textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
                  ).current = el
                }}
                className="font-mono text-sm resize-y rounded-t-none border-t-0"
                placeholder="Escribe el contenido legal aquí. Puedes usar texto plano o HTML básico..."
              />
              {errors.contenido && (
                <p className="text-xs text-destructive mt-1">
                  {errors.contenido.message}
                </p>
              )}
            </div>

            <p className="text-xs text-muted-foreground pb-2">
              Al guardar se incrementará automáticamente el número de versión.
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-col p-6 overflow-auto bg-muted/20">
          <LegalPreviewPanel titulo={tituloWatch} contenido={contenidoWatch} />
        </div>
      </div>

      <LegalHistorialModal
        open={historialAbierto}
        onClose={() => setHistorialAbierto(false)}
        tipo={tipo}
      />
    </form>
  )
}
