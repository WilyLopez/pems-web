'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@/lib/resolver'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Newspaper, Home, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
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
import { MediaUploader } from '@/components/common/MediaUploader'
import { NovedadPreview } from '@/components/admin/comercial/novedades/NovedadPreview'
import { QuickToggle } from '@/components/admin/comercial/shared/QuickToggle'
import { useNovedadesAdmin, useNovedadMutations } from '@/hooks/useComercial'
import { NovedadLocal } from '@/types/comercial.types'
import { MediaValue } from '@/types/media.types'
import { fixMediaUrl, resolverMediaValue } from '@/lib/media'

const schema = z.object({
  titulo:      z.string().min(1).max(50),
  descripcion: z.string().min(1).max(120),
  textoCta:    z.string().max(25).optional(),
  urlCta:      z.string().optional(),
  prioridad:   z.coerce.number().min(0).max(100).default(0),
  fechaInicio: z.string().optional(),
  fechaFin:    z.string().optional(),
  visibleHome: z.boolean().default(false),
  destacada:   z.boolean().default(false),
  activa:      z.boolean().default(true),
})
type FormValues = z.infer<typeof schema>

function NovedadFormDialog({
  open, onOpenChange, novedad, novedadesHome,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  novedad: NovedadLocal | null
  novedadesHome: number
}) {
  const { crear, actualizar } = useNovedadMutations()
  const isEditing = !!novedad
  const [imagenMedia, setImagenMedia] = useState<MediaValue | null>(null)
  const [uploading, setUploading]     = useState(false)
  const [mobileTab, setMobileTab]     = useState<'form' | 'preview'>('form')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titulo: '', descripcion: '', textoCta: '', urlCta: '',
      prioridad: 0, fechaInicio: '', fechaFin: '',
      visibleHome: false, destacada: false, activa: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (novedad) {
        reset({
          titulo: novedad.titulo, descripcion: novedad.descripcion,
          textoCta: novedad.textoCta ?? '', urlCta: novedad.urlCta ?? '',
          prioridad: novedad.prioridad,
          fechaInicio: novedad.fechaInicio ?? '', fechaFin: novedad.fechaFin ?? '',
          visibleHome: novedad.visibleHome, destacada: novedad.destacada, activa: novedad.activa,
        })
        setImagenMedia(novedad.imagenUrl
          ? { url: fixMediaUrl(novedad.imagenUrl), esLocal: false }
          : null)
      } else {
        reset({
          titulo: '', descripcion: '', textoCta: '', urlCta: '',
          prioridad: 0, fechaInicio: '', fechaFin: '',
          visibleHome: false, destacada: false, activa: true,
        })
        setImagenMedia(null)
      }
      setMobileTab('form')
    }
  }, [open, novedad, reset])

  const titulo      = watch('titulo')
  const descripcion = watch('descripcion')
  const textoCta    = watch('textoCta')
  const visibleHome = watch('visibleHome')

  const mostrarAlertaHome = visibleHome && novedadesHome >= 3 && !novedad?.visibleHome

  async function onSubmit(data: FormValues) {
    if (data.visibleHome && novedadesHome >= 3 && !isEditing) {
      toast.error('Ya hay 3 novedades en el inicio. Desactiva una antes de agregar otra.')
      return
    }
    setUploading(true)
    try {
      const imagenUrl = await resolverMediaValue(imagenMedia, 'novedades')
      const payload = {
        titulo: data.titulo, descripcion: data.descripcion,
        imagenUrl: imagenUrl ?? undefined,
        textoCta: data.textoCta || undefined, urlCta: data.urlCta || undefined,
        prioridad: data.prioridad,
        fechaInicio: data.fechaInicio || undefined, fechaFin: data.fechaFin || undefined,
        visibleHome: data.visibleHome, destacada: data.destacada,
      }
      if (isEditing && novedad) {
        await actualizar.mutateAsync({ id: novedad.id, payload: { ...payload, activa: data.activa } })
      } else {
        await crear.mutateAsync(payload)
      }
      onOpenChange(false)
      reset()
    } catch {
      toast.error('No se pudo guardar la novedad')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); setImagenMedia(null) } onOpenChange(v) }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar novedad' : 'Nueva novedad'}</DialogTitle>
        </DialogHeader>

        <div className="flex lg:hidden gap-1 rounded-lg bg-muted p-1 mb-2">
          {(['form', 'preview'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setMobileTab(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${mobileTab === t ? 'bg-white shadow-sm' : 'text-muted-foreground'}`}>
              {t === 'form' ? 'Formulario' : 'Vista previa'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-6">
            <div className={mobileTab === 'preview' ? 'hidden lg:block' : undefined}>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Título *</Label>
                    <span className="text-xs text-muted-foreground">{titulo?.length ?? 0}/50</span>
                  </div>
                  <Input {...register('titulo')} placeholder="Novedades de mayo" />
                  {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Descripción *</Label>
                    <span className="text-xs text-muted-foreground">{descripcion?.length ?? 0}/120</span>
                  </div>
                  <Textarea rows={2} {...register('descripcion')} className="resize-none" />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label>Imagen</Label>
                  <MediaUploader value={imagenMedia} onChange={setImagenMedia} carpeta="novedades" aspectRatio="16:9" uploading={uploading} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Texto CTA</Label>
                    <Input {...register('textoCta')} placeholder="Ver más" />
                  </div>
                  <div className="space-y-1">
                    <Label>URL CTA</Label>
                    <Input {...register('urlCta')} placeholder="/promociones" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Prioridad (0-100)</Label>
                    <Input type="number" {...register('prioridad')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Desde</Label>
                    <Input type="date" {...register('fechaInicio')} />
                  </div>
                  <div className="space-y-1">
                    <Label>Hasta</Label>
                    <Input type="date" {...register('fechaFin')} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('visibleHome')} className="w-4 h-4 rounded" />
                    <span className="text-sm">Visible en inicio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('destacada')} className="w-4 h-4 rounded" />
                    <span className="text-sm">Destacada</span>
                  </label>
                  {isEditing && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" {...register('activa')} className="w-4 h-4 rounded" />
                      <span className="text-sm">Activa</span>
                    </label>
                  )}
                </div>

                {mostrarAlertaHome && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                    Solo se muestran 3 novedades en el inicio. Esta reemplazará a la de menor prioridad.
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button type="button" variant="outline" onClick={() => { reset(); setImagenMedia(null); onOpenChange(false) }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={uploading} className="bg-brand-azul text-white">
                    {uploading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear novedad'}
                  </Button>
                </div>
              </div>
            </div>

            <div className={mobileTab === 'form' ? 'hidden lg:block' : undefined}>
              <div className="sticky top-0">
                <NovedadPreview
                  titulo={titulo}
                  descripcion={descripcion}
                  imagenUrl={imagenMedia?.url ?? null}
                  textoCta={textoCta}
                  visibleHome={visibleHome}
                />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function NovedadesPage() {
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<NovedadLocal | null>(null)
  const [deleteId, setDeleteId]     = useState<number | null>(null)

  const { data: novedades = [], isLoading, isError, refetch } = useNovedadesAdmin()
  const { eliminar, toggleActivo } = useNovedadMutations()

  const novedadesHome = novedades.filter((n) => n.visibleHome && n.activa).length

  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Comercial', href: '/admin/comercial' }, { label: 'Novedades' }]} />

      <PageHeader
        title="Novedades"
        description="Gestiona las novedades y noticias del sitio"
        actions={
          <Button size="sm" className="bg-brand-azul hover:bg-brand-azul/90 text-white gap-1.5"
            onClick={() => { setEditTarget(null); setFormOpen(true) }}>
            <Plus className="h-4 w-4" /> Nueva novedad
          </Button>
        }
      />

      {!isLoading && novedades.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {novedades.length} novedades · {novedadesHome} en inicio
        </p>
      )}

      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      )}

      {!isLoading && novedades.length === 0 && (
        <EmptyState title="Sin novedades" description="Crea la primera novedad para mostrarla en el sitio."
          icon={<Newspaper className="h-6 w-6" />}
          action={
            <Button size="sm" className="bg-brand-azul text-white gap-1.5"
              onClick={() => { setEditTarget(null); setFormOpen(true) }}>
              <Plus className="h-4 w-4" /> Nueva novedad
            </Button>
          }
        />
      )}

      {!isLoading && novedades.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                <th className="px-4 py-3 text-left">Novedad</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Prioridad</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Vigencia</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {novedades.map((n) => (
                <tr key={n.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {n.imagenUrl ? (
                        <img src={fixMediaUrl(n.imagenUrl)} alt={n.titulo}
                          className="w-14 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{n.descripcion}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell text-muted-foreground">{n.prioridad}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {n.fechaInicio && n.fechaFin ? `${n.fechaInicio} — ${n.fechaFin}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.visibleHome && (
                        <Badge className="bg-brand-azul/10 text-brand-azul text-xs h-5">
                          <Home className="h-3 w-3 mr-0.5" /> Inicio
                        </Badge>
                      )}
                      <QuickToggle
                        activo={n.activa}
                        onToggle={() => toggleActivo.mutate(n)}
                        isPending={toggleActivo.isPending && (toggleActivo.variables as NovedadLocal)?.id === n.id}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => { setEditTarget(n); setFormOpen(true) }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={() => setDeleteId(n.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NovedadFormDialog
        open={formOpen} onOpenChange={setFormOpen}
        novedad={editTarget} novedadesHome={novedadesHome}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Eliminar novedad"
        description="La novedad será eliminada permanentemente."
        confirmLabel="Eliminar"
        onConfirm={() => {
          if (deleteId !== null) eliminar.mutate(deleteId, { onSettled: () => setDeleteId(null) })
        }}
        loading={eliminar.isPending}
      />
    </div>
  )
}
