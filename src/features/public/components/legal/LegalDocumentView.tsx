'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FileText, Clock, Hash, Pencil, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import {
  useLegalPublicList,
  useLegalPublicBySlug,
} from '@/hooks/useContenidoLegal'
import { formatDate } from '@/lib/utils'
import { sanitizeLegalHtml } from '@/lib/sanitize'

function LegalSkeleton() {
  return (
    <section className="py-12 px-4">
      <div className="container max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="flex gap-2">
          <div className="h-7 w-24 rounded-full bg-gray-100" />
          <div className="h-7 w-24 rounded-full bg-gray-100" />
          <div className="h-7 w-24 rounded-full bg-gray-100" />
        </div>
        <div className="h-8 w-2/3 rounded bg-gray-100" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-5/6 rounded bg-gray-100" />
        </div>
      </div>
    </section>
  )
}

function LegalNotFound() {
  return (
    <section className="py-16 px-4">
      <div className="container max-w-xl mx-auto text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-gray-400" />
        </div>
        <h1 className="text-lg font-black text-gray-800">
          Documento no disponible
        </h1>
        <p className="text-sm text-muted-foreground">
          Este documento legal no existe o no se encuentra publicado en este
          momento.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-brand-azul px-4 py-2 text-sm font-medium text-white hover:bg-brand-azul/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}

export function LegalDocumentView() {
  const params = useParams<{ tipo: string }>()
  const slug = params?.tipo ?? ''

  const { tienePermiso } = useAuth()
  const { data: lista } = useLegalPublicList()
  const { data: doc, isLoading, isError } = useLegalPublicBySlug(slug)

  if (isLoading) return <LegalSkeleton />
  if (isError || !doc) return <LegalNotFound />

  const puedeEditar = tienePermiso('sitio.legal')

  return (
    <section className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        {lista && lista.length > 0 && (
          <nav className="flex flex-wrap gap-2 mb-8">
            {lista.map((item) => {
              const isActive = item.slug === slug
              return (
                <Link
                  key={item.slug}
                  href={`/legal/${item.slug}`}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-azul text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
                >
                  {item.etiqueta}
                </Link>
              )
            })}
          </nav>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-brand-azul" />
            </div>
            {puedeEditar && (
              <Link
                href="/admin/cms/legal"
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-azul/30 bg-brand-azul/5 px-3 py-1.5 text-xs font-medium text-brand-azul hover:bg-brand-azul/10 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Editar documento
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-black text-gray-900">{doc.titulo}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="h-3 w-3" /> Versión {doc.version}
            </span>
            {doc.fechaActualizacion && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Actualizado: {formatDate(doc.fechaActualizacion)}
              </span>
            )}
          </div>
        </div>

        <div
          className="prose prose-sm prose-gray max-w-none leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{
            __html: sanitizeLegalHtml(doc.contenido.replace(/\n/g, '<br />')),
          }}
        />

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-muted-foreground">
            Este documento corresponde a la versión {doc.version}
            {doc.fechaActualizacion
              ? `, última actualización el ${formatDate(doc.fechaActualizacion)}`
              : ''}
            .
          </p>
        </div>
      </div>
    </section>
  )
}
