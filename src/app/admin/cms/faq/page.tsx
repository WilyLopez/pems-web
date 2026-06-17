'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  useFaqsAdmin,
  useCrearFaq,
  useActualizarFaq,
  useToggleFaq,
  useReordenarFaqs,
  useEliminarFaq,
} from '@/hooks/useFaq'
import { Faq, CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  pregunta: z.string().min(5, 'Mínimo 5 caracteres').max(500),
  respuesta: z.string().min(10, 'Mínimo 10 caracteres').max(2000),
  visible: z.boolean().default(true),
})
type FormValues = z.infer<typeof schema>

// ── Dialog form ───────────────────────────────────────────────────────────────

function FaqFormDialog({
  open,
  onOpenChange,
  faq,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  faq: Faq | null
  onSubmit: (payload: CrearFaqPayload | ActualizarFaqPayload) => void
  isLoading: boolean
}) {
  const isEditing = !!faq
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
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
          <DialogTitle>{isEditing ? 'Editar FAQ' : 'Nueva FAQ'}</DialogTitle>
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
                  : 'Crear FAQ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Fila FAQ ──────────────────────────────────────────────────────────────────

function FaqRow({
  faq,
  index,
  total,
  onEdit,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  faq: Faq
  index: number
  total: number
  onEdit: (f: Faq) => void
  onToggle: (f: Faq) => void
  onDelete: (id: number) => void
  onMoveUp: (i: number) => void
  onMoveDown: (i: number) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start gap-3 p-4">
          {/* Reorder */}
          <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMoveDown(index)}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className="font-medium text-sm text-left hover:text-brand-azul transition-colors"
                onClick={() => setExpanded(!expanded)}
              >
                {faq.pregunta}
              </button>
              {!faq.visible && (
                <Badge
                  variant="outline"
                  className="text-xs h-5 text-muted-foreground"
                >
                  <EyeOff className="h-3 w-3 mr-1" />
                  Oculta
                </Badge>
              )}
            </div>
            {expanded && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {faq.respuesta}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onToggle(faq)}
              title={faq.visible ? 'Ocultar' : 'Mostrar'}
            >
              {faq.visible ? (
                <Eye className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(faq)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:text-destructive"
              onClick={() => onDelete(faq.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function FaqPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Faq | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: faqs = [], isLoading, isError, refetch } = useFaqsAdmin()

  const crear = useCrearFaq()
  const actualizar = useActualizarFaq()
  const toggle = useToggleFaq()
  const reordenar = useReordenarFaqs()
  const eliminar = useEliminarFaq()

  function handleMoveUp(index: number) {
    if (index === 0) return
    const newOrder = [...faqs]
    ;[newOrder[index - 1], newOrder[index]] = [
      newOrder[index],
      newOrder[index - 1],
    ]
    reordenar.mutate(newOrder.map((f) => f.id))
  }

  function handleMoveDown(index: number) {
    if (index >= faqs.length - 1) return
    const newOrder = [...faqs]
    ;[newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ]
    reordenar.mutate(newOrder.map((f) => f.id))
  }

  function handleSubmit(payload: CrearFaqPayload | ActualizarFaqPayload) {
    if (editTarget) {
      actualizar.mutate(
        { id: editTarget.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false)
            setEditTarget(null)
          },
        }
      )
    } else {
      crear.mutate(payload as CrearFaqPayload, {
        onSuccess: () => setFormOpen(false),
      })
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  const visibles = Array.isArray(faqs)
    ? faqs.filter((f) => f.visible).length
    : 0

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Preguntas Frecuentes' },
        ]}
      />

      <PageHeader
        title="Preguntas Frecuentes"
        description="Crea y ordena las FAQs del sitio público"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => {
              setEditTarget(null)
              setFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Nueva FAQ
          </Button>
        }
      />

      {!isLoading && faqs.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {faqs.length} preguntas · {visibles} visibles
        </p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && faqs.length === 0 && (
        <EmptyState
          title="Sin preguntas frecuentes"
          description="Crea la primera FAQ para mostrarla en el sitio."
          icon={<HelpCircle className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={() => {
                setEditTarget(null)
                setFormOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> Nueva FAQ
            </Button>
          }
        />
      )}

      {!isLoading && faqs.length > 0 && (
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              index={i}
              total={faqs.length}
              onEdit={(f) => {
                setEditTarget(f)
                setFormOpen(true)
              }}
              onToggle={(f) => toggle.mutate({ id: f.id, visible: f.visible })}
              onDelete={(id) => setDeleteId(id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </div>
      )}

      <FaqFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        faq={editTarget}
        onSubmit={handleSubmit}
        isLoading={crear.isPending || actualizar.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar FAQ?"
        description="Esta pregunta será eliminada permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null)
            eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
