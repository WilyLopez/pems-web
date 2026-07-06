'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/common/Emptystate'
import { Image as ImageIcon } from 'lucide-react'
import {
  useImagen,
  useActualizarImagen,
} from '@/features/admin/cms/galeria/hooks/useGaleria'
import { ImagenForm } from '@/features/admin/cms/galeria/components/ImagenForm'
import { CATEGORIA_POR_DEFECTO } from '@/features/admin/cms/galeria/constants/categorias'
import { idDesdeSlug } from '@/features/admin/cms/galeria/lib/archivo'
import { MetadatosImagenFormValues } from '@/features/admin/cms/galeria/schemas/galeria.schema'

const RUTA_GALERIA = '/admin/cms/galeria'

export default function EditarImagenPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const id = idDesdeSlug(params.slug)

  const { data: imagen, isLoading, isError } = useImagen(id)
  const actualizar = useActualizarImagen()

  const nombre = imagen?.titulo || 'Editar imagen'

  function volver() {
    router.push(RUTA_GALERIA)
  }

  function handleSubmit(values: MetadatosImagenFormValues) {
    actualizar.mutate({ id, payload: values }, { onSuccess: volver })
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'CMS', href: '/admin/cms' },
          { label: 'Galería', href: RUTA_GALERIA },
          { label: nombre },
        ]}
      />

      <PageHeader
        title={nombre}
        description="Actualiza los metadatos de la imagen"
      />

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </CardContent>
        </Card>
      )}

      {!isLoading && (isError || !imagen) && (
        <EmptyState
          title="Imagen no encontrada"
          description="No se pudo cargar la imagen solicitada."
          icon={<ImageIcon className="h-6 w-6" />}
          action={
            <Button variant="outline" onClick={volver}>
              Volver a la galería
            </Button>
          }
        />
      )}

      {!isLoading && imagen && (
        <Card>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-[220px_1fr]">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted">
              <Image
                src={imagen.url}
                alt={imagen.altTexto ?? imagen.titulo ?? 'Imagen galería'}
                fill
                unoptimized
                sizes="220px"
                className="object-cover"
              />
            </div>
            <ImagenForm
              defaultValues={{
                titulo: imagen.titulo ?? '',
                descripcion: imagen.descripcion ?? '',
                altTexto: imagen.altTexto ?? '',
                categoria: imagen.categoria ?? CATEGORIA_POR_DEFECTO,
                orden: imagen.orden ?? 0,
              }}
              onSubmit={handleSubmit}
              onCancel={volver}
              isSubmitting={actualizar.isPending}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
