'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Save,
  FileText,
  Plus,
  Trash2,
  Hash,
  Clock,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Separator } from '@/components/ui/Separator'
import { ErrorState } from '@/components/common/Errorstate'
import { LegalFormatToolbar } from '@/components/admin/legal/LegalFormatToolbar'
import { LegalPreviewPanel } from '@/components/admin/legal/LegalPreviewPanel'
import { LegalNuevoDocumentoModal } from '@/components/admin/legal/LegalNuevoDocumentoModal'
import {
  useContenidoLegalAdmin,
  useActualizarLegal,
  useToggleLegal,
  useEliminarContenidoLegal,
} from '@/hooks/useContenidoLegal'
import { labelParaTipo, esTipoPredefinido, TIPOS_SIEMPRE_ACTIVOS } from '@/types/legal.types'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const schema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  contenido: z.string().min(20, 'El contenido es muy corto').max(50000),
})
type FormValues = z.infer<typeof schema>

function LegalEditorSection({ tipo }: { tipo: string }) {
  const { data: todos, isLoading, isError, refetch } = useContenidoLegalAdmin()
  const actualizar = useActualizarLegal()
  const [wordCount, setWordCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const doc = todos?.find((d) => d.tipo === tipo)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
      setValue('contenido', newValue, { shouldDirty: true, shouldValidate: false })
    },
    [setValue]
  )

  function onSubmit(data: FormValues) {
    actualizar.mutate({ tipo, payload: { titulo: data.titulo, contenido: data.contenido } })
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
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          className="bg-brand-azul text-white gap-1.5 h-8 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          {actualizar.isPending ? 'Guardando...' : 'Guardar versión'}
        </Button>
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
                <p className="text-xs text-destructive mt-1">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label htmlFor={`contenido-${tipo}`}>Contenido *</Label>
                <span className="text-xs text-muted-foreground">{wordCount} palabras</span>
              </div>
              <LegalFormatToolbar
                textareaRef={textareaRef as React.RefObject<HTMLTextAreaElement>}
                onChange={handleToolbarChange}
              />
              <Textarea
                id={`contenido-${tipo}`}
                rows={22}
                {...registerContenido}
                ref={(el) => {
                  rhfRef(el)
                  ;(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el
                }}
                className="font-mono text-sm resize-y rounded-t-none border-t-0"
                placeholder="Escribe el contenido legal aquí. Puedes usar texto plano o HTML básico..."
              />
              {errors.contenido && (
                <p className="text-xs text-destructive mt-1">{errors.contenido.message}</p>
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
    </form>
  )
}

function LegalNavSidebar({
  tipos,
  tipoActivo,
  onSelect,
  onNuevo,
  onToggle,
  onEliminar,
}: {
  tipos: Array<{ tipo: string; activo: boolean }>
  tipoActivo: string
  onSelect: (tipo: string) => void
  onNuevo: () => void
  onToggle: (tipo: string, activo: boolean) => void
  onEliminar: (tipo: string) => void
}) {
  return (
    <aside className="w-56 shrink-0 border-r flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Documentos
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onNuevo}
          className="h-6 w-6 p-0"
          title="Nuevo documento"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <nav className="flex-1 overflow-auto py-1">
        {tipos.map(({ tipo, activo }) => (
          <div
            key={tipo}
            className={cn(
              'group flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors',
              tipoActivo === tipo && 'bg-brand-azul/10 border-r-2 border-brand-azul'
            )}
            onClick={() => onSelect(tipo)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText
                className={cn(
                  'h-3.5 w-3.5 shrink-0',
                  tipoActivo === tipo ? 'text-brand-azul' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs truncate',
                  tipoActivo === tipo ? 'font-semibold text-brand-azul' : 'text-foreground'
                )}
              >
                {labelParaTipo(tipo)}
              </span>
            </div>

            {TIPOS_SIEMPRE_ACTIVOS.has(tipo) ? (
              <span
                title="Siempre activo — requerido por el sistema"
                className="shrink-0 ml-1 flex items-center gap-0.5 text-[10px] font-medium text-brand-azul/70"
              >
                <ShieldCheck className="h-3 w-3" />
              </span>
            ) : !esTipoPredefinido(tipo) && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                <button
                  type="button"
                  title={activo ? 'Desactivar' : 'Activar'}
                  onClick={(e) => { e.stopPropagation(); onToggle(tipo, !activo) }}
                  className="p-0.5 rounded hover:bg-muted"
                >
                  {activo ? (
                    <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                  )}
                </button>

                <button
                  type="button"
                  title="Eliminar"
                  onClick={(e) => { e.stopPropagation(); onEliminar(tipo) }}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default function LegalPage() {
  const { data: todos, isLoading } = useContenidoLegalAdmin()
  const toggle = useToggleLegal()
  const eliminar = useEliminarContenidoLegal()

  const tipos = todos?.map((d) => ({ tipo: d.tipo, activo: d.activo })) ?? []

  const [tipoActivo, setTipoActivo] = useState('TERMINOS')
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [tipoAEliminar, setTipoAEliminar] = useState<string | null>(null)

  useEffect(() => {
    if (todos && todos.length > 0 && !todos.find((d) => d.tipo === tipoActivo)) {
      setTipoActivo(todos[0].tipo)
    }
  }, [todos, tipoActivo])

  return (
    <div className="flex flex-col h-full space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Contenido Legal' },
        ]}
      />

      <PageHeader
        title="Contenido Legal"
        description="Gestiona los documentos legales del sitio. Cada guardado crea una nueva versión."
      />

      <div className="flex-1 rounded-xl border bg-background overflow-hidden flex min-h-0" style={{ minHeight: '600px' }}>
        {isLoading ? (
          <div className="flex-1 p-6 space-y-3">
            <Skeleton className="h-8 w-40 rounded" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        ) : (
          <>
            <LegalNavSidebar
              tipos={tipos}
              tipoActivo={tipoActivo}
              onSelect={setTipoActivo}
              onNuevo={() => setModalNuevoAbierto(true)}
              onToggle={(tipo, activo) => toggle.mutate({ tipo, activo })}
              onEliminar={(tipo) => setTipoAEliminar(tipo)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {todos?.find((d) => d.tipo === tipoActivo) !== undefined || true ? (
                <LegalEditorSection key={tipoActivo} tipo={tipoActivo} />
              ) : null}
            </div>
          </>
        )}
      </div>

      <LegalNuevoDocumentoModal
        open={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        onCreado={(tipo) => setTipoActivo(tipo)}
      />

      <ConfirmDialog
        open={!!tipoAEliminar}
        onOpenChange={(v) => !v && setTipoAEliminar(null)}
        title="Eliminar documento"
        description={`¿Eliminar el documento "${tipoAEliminar ? labelParaTipo(tipoAEliminar) : ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        destructive
        loading={eliminar.isPending}
        onConfirm={() => {
          if (tipoAEliminar) {
            eliminar.mutate(tipoAEliminar, {
              onSuccess: () => setTipoAEliminar(null),
            })
          }
        }}
      />
    </div>
  )
}
