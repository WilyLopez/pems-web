'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, FileText, Clock, Hash } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/common/Errorstate'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Label } from '@/components/ui/Label'
import {
  useContenidoLegalAdmin,
  useActualizarLegal,
} from '@/hooks/useContenidoLegal'
import {
  TipoLegal,
  TIPO_LEGAL_LABELS,
  ActualizarLegalPayload,
} from '@/types/legal.types'
import { formatDateTime } from '@/lib/utils'

const schema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  contenido: z.string().min(20, 'El contenido es muy corto').max(50000),
})
type FormValues = z.infer<typeof schema>

const TIPOS: TipoLegal[] = ['TERMINOS', 'PRIVACIDAD', 'REEMBOLSO', 'MENORES']

function LegalEditor({ tipo }: { tipo: TipoLegal }) {
  const { data: todos, isLoading, isError, refetch } = useContenidoLegalAdmin()
  const actualizar = useActualizarLegal()
  const [wordCount, setWordCount] = useState(0)

  const doc = todos?.find((d) => d.tipo === tipo)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { titulo: '', contenido: '' },
  })

  const contenidoWatch = watch('contenido')

  useEffect(() => {
    setWordCount(contenidoWatch?.split(/\s+/).filter(Boolean).length ?? 0)
  }, [contenidoWatch])

  useEffect(() => {
    if (doc) {
      reset({ titulo: doc.titulo, contenido: doc.contenido })
    }
  }, [doc, reset])

  function onSubmit(data: FormValues) {
    const payload: ActualizarLegalPayload = {
      titulo: data.titulo,
      contenido: data.contenido,
    }
    actualizar.mutate({ tipo, payload })
  }

  if (isError) return <ErrorState onRetry={refetch} />

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {doc && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            Versión {doc.version}
          </span>
          {doc.fechaActualizacion && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última actualización: {formatDateTime(doc.fechaActualizacion)}
            </span>
          )}
          {doc.activo && (
            <Badge className="bg-green-100 text-green-800 h-5 text-xs">
              Activo
            </Badge>
          )}
        </div>
      )}

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
        <Textarea
          id={`contenido-${tipo}`}
          rows={20}
          {...register('contenido')}
          className="font-mono text-sm resize-y"
          placeholder="Escribe el contenido legal aquí. Puedes usar texto plano o HTML básico..."
        />
        {errors.contenido && (
          <p className="text-xs text-destructive mt-1">
            {errors.contenido.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Al guardar se incrementará automáticamente el número de versión.
        </p>
        <Button
          type="submit"
          disabled={actualizar.isPending || !isDirty}
          className="bg-brand-azul text-white gap-1.5"
        >
          <Save className="h-4 w-4" />
          {actualizar.isPending ? 'Guardando...' : 'Guardar versión'}
        </Button>
      </div>
    </form>
  )
}

export default function LegalPage() {
  return (
    <div className="space-y-4">
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

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Selecciona el documento a editar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="TERMINOS">
            <TabsList className="w-full sm:w-auto">
              {TIPOS.map((tipo) => (
                <TabsTrigger key={tipo} value={tipo} className="text-xs">
                  {TIPO_LEGAL_LABELS[tipo]}
                </TabsTrigger>
              ))}
            </TabsList>

            {TIPOS.map((tipo) => (
              <TabsContent key={tipo} value={tipo} className="mt-6">
                <LegalEditor tipo={tipo} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
