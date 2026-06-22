'use client'

import { useState } from 'react'
import { CheckCircle, Star } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  useResenas,
  useAprobarResena,
  useRechazarResena,
  useDestacarResena,
  useToggleHome,
} from '@/features/admin/cms/resenas/hooks/useResenas'
import { Resena } from '@/types/resena.types'
import { ResenaCard } from '@/features/admin/cms/resenas/components/ResenaCard'
import { ResponderDialog } from '@/features/admin/cms/resenas/components/ResponderDialog'

// ── Página ────────────────────────────────────────────────────────────────────

export default function ResenasPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('tab') || 'pendientes'

  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [responderTarget, setResponderTarget] = useState<Resena | null>(null)
  const [rechazarId, setRechazarId] = useState<number | null>(null)

  const pendientes = useResenas(true)
  const aprobadas = useResenas(false)

  const aprobar = useAprobarResena()
  const rechazar = useRechazarResena()
  const destacar = useDestacarResena()
  const toggleHome = useToggleHome()

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

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

      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
        loading={rechazar.isPending}
      />
    </div>
  )
}
