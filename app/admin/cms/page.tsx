'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Star } from 'lucide-react'
import { cmsService, Resena } from '@/services/cms.service'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/Emptystate'
import { ErrorState } from '@/components/common/Errorstate'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

const KEY = 'resenas'

function ResenaCard({ resena, onAprobar, onRechazar, loadingId }: {
  resena: Resena
  onAprobar: (id: number) => void
  onRechazar: (id: number) => void
  loadingId: number | null
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{resena.nombreAutor}</p>
            <p className="text-xs text-muted-foreground">{formatDate(resena.fechaCreacion)}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < resena.calificacion ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{resena.contenido}</p>
        {!resena.aprobada && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onAprobar(resena.id)}
              disabled={loadingId === resena.id}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => onRechazar(resena.id)}
              disabled={loadingId === resena.id}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Rechazar
            </Button>
          </div>
        )}
        {resena.aprobada && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            Publicada
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

export default function CmsPage() {
  const queryClient = useQueryClient()
  const [loadingId, setLoadingId] = useState<number | null>(null)

  const pendientes = useQuery({
    queryKey: [KEY, 'pendientes'],
    queryFn: () => cmsService.listarResenas(true),
  })

  const aprobadas = useQuery({
    queryKey: [KEY, 'aprobadas'],
    queryFn: () => cmsService.listarResenas(false),
  })

  const aprobar = useMutation({
    mutationFn: (id: number) => cmsService.aprobarResena(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      toast.success('Reseña aprobada y publicada.')
    },
    onError: () => toast.error('No se pudo aprobar la reseña.'),
    onSettled: () => setLoadingId(null),
  })

  const rechazar = useMutation({
    mutationFn: (id: number) => cmsService.rechazarResena(id),
    onMutate: (id) => setLoadingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] })
      toast.success('Reseña eliminada.')
    },
    onError: () => toast.error('No se pudo rechazar la reseña.'),
    onSettled: () => setLoadingId(null),
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="CMS"
        description="Gestión de contenido del sitio web público"
      />

      <Tabs defaultValue="pendientes">
        <TabsList>
          <TabsTrigger value="pendientes">
            Reseñas pendientes
            {(pendientes.data?.length ?? 0) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {pendientes.data!.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprobadas">Reseñas publicadas</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="mt-4">
          {pendientes.isError && <ErrorState onRetry={pendientes.refetch} />}
          {pendientes.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
            </div>
          )}
          {!pendientes.isLoading && !pendientes.isError && (
            (pendientes.data?.length ?? 0) === 0
              ? <EmptyState title="No hay reseñas pendientes" description="Todas las reseñas han sido moderadas." icon={<CheckCircle className="h-6 w-6" />} />
              : <div className="grid gap-3 sm:grid-cols-2">
                  {pendientes.data?.map((r) => (
                    <ResenaCard
                      key={r.id} resena={r} loadingId={loadingId}
                      onAprobar={(id) => aprobar.mutate(id)}
                      onRechazar={(id) => rechazar.mutate(id)}
                    />
                  ))}
                </div>
          )}
        </TabsContent>

        <TabsContent value="aprobadas" className="mt-4">
          {!aprobadas.isLoading && (
            <div className="grid gap-3 sm:grid-cols-2">
              {aprobadas.data?.map((r) => (
                <ResenaCard
                  key={r.id} resena={r} loadingId={loadingId}
                  onAprobar={(id) => aprobar.mutate(id)}
                  onRechazar={(id) => rechazar.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border rounded-md">
            Gestión de banners — próximamente
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}