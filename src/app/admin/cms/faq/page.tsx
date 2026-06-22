'use client'

import { useState } from 'react'
import { Plus, HelpCircle, Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useFaqsAdmin,
  useCrearFaq,
  useActualizarFaq,
  useToggleFaq,
  useReordenarFaqs,
  useEliminarFaq,
} from '@/features/admin/cms/faq/hooks/useFaq'
import { Faq, CrearFaqPayload, ActualizarFaqPayload } from '@/types/faq.types'
import { FaqFormDialog } from '@/features/admin/cms/faq/components/FaqFormDialog'
import { FaqRow } from '@/features/admin/cms/faq/components/FaqRow'

export default function FaqPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const formOpenParam = searchParams.get('open') === 'true'
  const editIdParam = searchParams.get('edit')

  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: faqs = [], isLoading, isError, refetch } = useFaqsAdmin()

  const crear = useCrearFaq()
  const actualizar = useActualizarFaq()
  const toggle = useToggleFaq()
  const reordenar = useReordenarFaqs()
  const eliminar = useEliminarFaq()

  const editTarget = editIdParam
    ? faqs.find((f) => f.id === Number(editIdParam)) ?? null
    : null

  const formOpen = formOpenParam || !!editTarget

  function handleOpenCreate() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('open', 'true')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleOpenEdit(faq: Faq) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit', faq.id.toString())
    params.delete('open')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleCloseForm() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('open')
    params.delete('edit')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

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
            handleCloseForm()
          },
        }
      )
    } else {
      crear.mutate(payload as CrearFaqPayload, {
        onSuccess: () => handleCloseForm(),
      })
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  const filteredFaqs = faqs.filter(
    (f) =>
      f.pregunta.toLowerCase().includes(query.toLowerCase()) ||
      f.respuesta.toLowerCase().includes(query.toLowerCase())
  )

  const visibles = Array.isArray(faqs)
    ? faqs.filter((f) => f.visible).length
    : 0

  const isSearching = query.trim().length > 0

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
        description="Crea y ordena las preguntas frecuentes del sitio público"
        actions={
          <Button
            size="sm"
            className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4" />
            Nueva Pregunta
          </Button>
        }
      />

      {faqs.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar pregunta frecuente..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-xl"
          />
        </div>
      )}

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
          description="Crea la primera pregunta frecuente para mostrarla en el sitio."
          icon={<HelpCircle className="h-6 w-6" />}
          action={
            <Button
              size="sm"
              className="bg-brand-azul text-white gap-1.5"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4" /> Nueva Pregunta
            </Button>
          }
        />
      )}

      {!isLoading && faqs.length > 0 && filteredFaqs.length === 0 && (
        <EmptyState
          title="Sin resultados"
          description={`No encontramos preguntas frecuentes que coincidan con "${query}".`}
          icon={<HelpCircle className="h-6 w-6" />}
        />
      )}

      {!isLoading && filteredFaqs.length > 0 && (
        <div className="space-y-2">
          {filteredFaqs.map((faq, i) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              index={i}
              total={filteredFaqs.length}
              onEdit={handleOpenEdit}
              onToggle={(f) => toggle.mutate({ id: f.id, visible: f.visible })}
              onDelete={(id) => setDeleteId(id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              disableReorder={isSearching}
            />
          ))}
        </div>
      )}

      <FaqFormDialog
        key={editIdParam ?? (formOpenParam ? 'new' : 'none')}
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseForm()
        }}
        faq={editTarget}
        onSubmit={handleSubmit}
        isLoading={crear.isPending || actualizar.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="¿Eliminar pregunta frecuente?"
        description="Esta pregunta frecuente será eliminada permanentemente."
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
