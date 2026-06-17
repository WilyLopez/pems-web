'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Check, ArrowLeft, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import { Label } from '@/components/ui/Label'
import { useBeneficiosPaquete, useBeneficioMutations, usePaquetesAdmin } from '@/hooks/useComercial'
import { BeneficioPaquete } from '@/types/comercial.types'

const schema = z.object({
  descripcion: z.string().min(1).max(100),
  orden:       z.coerce.number().default(0),
})
type FormValues = z.infer<typeof schema>

export default function BeneficiosPage() {
  const params = useParams()
  const idPaquete = Number(params.id)
  
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BeneficioPaquete | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const { data: paquetes = [] } = usePaquetesAdmin()
  const paquete = paquetes.find(p => p.id === idPaquete)
  
  const { data: beneficios = [], isLoading, isError, refetch } = useBeneficiosPaquete(idPaquete)
  const { crear, actualizar, eliminar } = useBeneficioMutations(idPaquete)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  function handleOpenForm(b: BeneficioPaquete | null = null) {
    setEditTarget(b)
    if (b) {
      reset({ descripcion: b.descripcion, orden: b.orden })
    } else {
      reset({ descripcion: '', orden: beneficios.length })
    }
    setFormOpen(true)
  }

  async function onSubmit(data: FormValues) {
    try {
      if (editTarget) {
        await actualizar.mutateAsync({ id: editTarget.id, payload: data })
      } else {
        await crear.mutateAsync(data)
      }
      setFormOpen(false)
    } catch {
      toast.error('No se pudo guardar el beneficio')
    }
  }

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[
        { label: 'Comercial', href: '/admin/comercial' },
        { label: 'Paquetes', href: '/admin/comercial/paquetes' },
        { label: paquete?.nombre ?? 'Paquete', href: `/admin/comercial/paquetes` },
        { label: 'Beneficios' }
      ]} />

      <PageHeader
        title={`Beneficios: ${paquete?.nombre ?? 'Cargando...'}`}
        description="Administra lo que incluye este paquete de evento"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/comercial/paquetes">
                <ArrowLeft className="h-4 w-4 mr-1" /> Volver
              </Link>
            </Button>
            <Button size="sm" className="bg-brand-azul text-white gap-1.5" onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4" /> Nuevo beneficio
            </Button>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : beneficios.length === 0 ? (
          <EmptyState
            title="Sin beneficios"
            description="Añade los elementos que incluye este paquete."
            icon={<ListChecks className="h-10 w-10 text-muted-foreground" />}
            action={<Button onClick={() => handleOpenForm()}>Agregar beneficio</Button>}
          />
        ) : (
          <Card>
            <CardContent className="p-0 divide-y">
              {beneficios.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-menta/20 flex items-center justify-center">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{b.descripcion}</p>
                      <p className="text-xs text-muted-foreground">Orden: {b.orden}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenForm(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive" onClick={() => setDeleteId(b.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar beneficio' : 'Nuevo beneficio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input {...register('descripcion')} placeholder="Ej: 2 horas de local exclusivo" />
              {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-brand-azul text-white">
                {editTarget ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar beneficio"
        description="¿Estás seguro de eliminar este beneficio? Esta acción no se puede deshacer."
        onConfirm={() => {
          if (deleteId) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
