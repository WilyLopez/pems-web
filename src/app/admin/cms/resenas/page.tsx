'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Home,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useResenas,
  useAprobarResena,
  useRechazarResena,
  useResponderResena,
  useDestacarResena,
  useToggleHome,
} from '@/hooks/useResenas'
import { Resena } from '@/types/resena.types'
import { formatDate } from '@/lib/utils'

// ── Estrellas ─────────────────────────────────────────────────────────────────

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  )
}

// ── Dialog respuesta ──────────────────────────────────────────────────────────

const respuestaSchema = z.object({
  respuesta: z.string().min(1, 'La respuesta es obligatoria'),
})
type RespuestaForm = z.infer<typeof respuestaSchema>

function ResponderDialog({
  resena,
  open,
  onOpenChange,
}: {
  resena: Resena | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const responder = useResponderResena()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RespuestaForm>({
    resolver: zodResolver(respuestaSchema),
    defaultValues: { respuesta: resena?.respuestaAdmin ?? '' },
  })

  function onSubmit(data: RespuestaForm) {
    if (!resena) return
    responder.mutate(
      { id: resena.id, payload: { respuesta: data.respuesta } },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Responder reseña</DialogTitle>
        </DialogHeader>
        {resena && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground italic">
              &quot;{resena.contenido}&quot;
              <p className="mt-1 font-medium text-foreground not-italic">
                — {resena.nombreAutor}
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <Label>Tu respuesta</Label>
                <Textarea
                  rows={4}
                  placeholder="Escribe tu respuesta como administrador..."
                  {...register('respuesta')}
                  className="mt-1 resize-none"
                />
                {errors.respuesta && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.respuesta.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={responder.isPending}
                  className="bg-brand-azul text-white"
                >
                  {responder.isPending ? 'Guardando...' : 'Guardar respuesta'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Tarjeta reseña ────────────────────────────────────────────────────────────

function ResenaCard({
  resena,
  showActions,
  loadingId,
  onAprobar,
  onRechazar,
  onResponder,
  onDestacar,
  onToggleHome,
}: {
  resena: Resena
  showActions: boolean
  loadingId: number | null
  onAprobar?: () => void
  onRechazar?: () => void
  onResponder: () => void
  onDestacar: () => void
  onToggleHome: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isBusy = loadingId === resena.id

  return (
    <Card className={`transition-opacity ${isBusy ? 'opacity-60' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {resena.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resena.fotoUrl}
                alt={resena.nombreAutor}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-azul/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand-azul">
                {resena.nombreAutor.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{resena.nombreAutor}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(resena.fechaCreacion)}
              </p>
            </div>
          </div>
          <Stars value={resena.calificacion} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {resena.contenido}
        </p>

        {resena.respuestaAdmin && (
          <div className="bg-brand-azul/5 border border-brand-azul/20 rounded-lg p-3">
            <p className="text-xs font-semibold text-brand-azul mb-1">
              Respuesta del equipo
            </p>
            <p className="text-xs text-muted-foreground">
              {resena.respuestaAdmin}
            </p>
          </div>
        )}

        {/* Estado badges */}
        <div className="flex flex-wrap gap-1.5">
          {resena.aprobada && (
            <Badge className="bg-green-100 text-green-800 text-xs h-5">
              Publicada
            </Badge>
          )}
          {resena.destacada && (
            <Badge className="bg-amber-100 text-amber-800 text-xs h-5">
              <Award className="h-3 w-3 mr-0.5" />
              Destacada
            </Badge>
          )}
          {resena.mostrarHome && (
            <Badge className="bg-brand-azul/10 text-brand-azul text-xs h-5">
              <Home className="h-3 w-3 mr-0.5" />
              Inicio
            </Badge>
          )}
        </div>

        {/* Acciones */}
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Acciones{' '}
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {expanded && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t">
              {showActions && onAprobar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={onAprobar}
                  disabled={isBusy}
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Aprobar
                </Button>
              )}
              {showActions && onRechazar && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 text-destructive border-destructive/30"
                  onClick={onRechazar}
                  disabled={isBusy}
                >
                  <XCircle className="h-3.5 w-3.5" /> Rechazar
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onResponder}
                disabled={isBusy}
              >
                <MessageSquare className="h-3.5 w-3.5" />{' '}
                {resena.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onDestacar}
                disabled={isBusy}
              >
                <Award className="h-3.5 w-3.5" />{' '}
                {resena.destacada ? 'Quitar destacado' : 'Destacar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={onToggleHome}
                disabled={isBusy}
              >
                <Home className="h-3.5 w-3.5" />{' '}
                {resena.mostrarHome ? 'Quitar de inicio' : 'Mostrar en inicio'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function ResenasPage() {
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [responderTarget, setResponderTarget] = useState<Resena | null>(null)
  const [rechazarId, setRechazarId] = useState<number | null>(null)

  const pendientes = useResenas(true)
  const aprobadas = useResenas(false)

  const aprobar = useAprobarResena()
  const rechazar = useRechazarResena()
  const destacar = useDestacarResena()
  const toggleHome = useToggleHome()

  function withLoading(id: number, fn: () => void) {
    setLoadingId(id)
    fn()
    setTimeout(() => setLoadingId(null), 1500)
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'CMS', href: '/admin/cms' }, { label: 'Reseñas' }]}
      />

      <PageHeader
        title="Reseñas"
        description="Modera las reseñas enviadas por clientes"
      />

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Pendientes
            {(pendientes.data?.totalElements ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {pendientes.data!.totalElements}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobadas">Publicadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-4">
          {pendientes.isError && <ErrorState onRetry={pendientes.refetch} />}
          {pendientes.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          )}
          {!pendientes.isLoading &&
            !pendientes.isError &&
            ((pendientes.data?.content?.length ?? 0) === 0 ? (
              <EmptyState
                title="No hay reseñas pendientes"
                description="Todas las reseñas han sido moderadas."
                icon={<CheckCircle className="h-6 w-6" />}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {pendientes.data?.content?.map((r) => (
                  <ResenaCard
                    key={r.id}
                    resena={r}
                    showActions
                    loadingId={loadingId}
                    onAprobar={() =>
                      withLoading(r.id, () => aprobar.mutate(r.id))
                    }
                    onRechazar={() => setRechazarId(r.id)}
                    onResponder={() => setResponderTarget(r)}
                    onDestacar={() =>
                      withLoading(r.id, () =>
                        destacar.mutate({ id: r.id, destacada: r.destacada })
                      )
                    }
                    onToggleHome={() =>
                      withLoading(r.id, () =>
                        toggleHome.mutate({ id: r.id, mostrar: !r.mostrarHome })
                      )
                    }
                  />
                ))}
              </div>
            ))}
        </TabsContent>

        <TabsContent value="aprobadas" className="mt-4">
          {aprobadas.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          )}
          {!aprobadas.isLoading &&
            ((aprobadas.data?.content?.length ?? 0) === 0 ? (
              <EmptyState
                title="Sin reseñas publicadas"
                description="Aprueba reseñas para que aparezcan aquí."
                icon={<Star className="h-6 w-6" />}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {aprobadas.data?.content?.map((r) => (
                  <ResenaCard
                    key={r.id}
                    resena={r}
                    showActions={false}
                    loadingId={loadingId}
                    onResponder={() => setResponderTarget(r)}
                    onDestacar={() =>
                      withLoading(r.id, () =>
                        destacar.mutate({ id: r.id, destacada: r.destacada })
                      )
                    }
                    onToggleHome={() =>
                      withLoading(r.id, () =>
                        toggleHome.mutate({ id: r.id, mostrar: !r.mostrarHome })
                      )
                    }
                  />
                ))}
              </div>
            ))}
        </TabsContent>
      </Tabs>

      <ResponderDialog
        resena={responderTarget}
        open={!!responderTarget}
        onOpenChange={(v) => !v && setResponderTarget(null)}
      />

      <ConfirmDialog
        open={rechazarId !== null}
        onOpenChange={(v) => !v && setRechazarId(null)}
        title="¿Rechazar reseña?"
        description="La reseña será eliminada permanentemente."
        confirmLabel="Rechazar"
        onConfirm={() => {
          if (rechazarId !== null) {
            rechazar.mutate(rechazarId, {
              onSettled: () => setRechazarId(null),
            })
          }
        }}
        isLoading={rechazar.isPending}
      />
    </div>
  )
}
