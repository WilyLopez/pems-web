import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FileText, Clock, Hash, Pencil } from 'lucide-react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { legalService } from '@/services/legal.service'
import { buildMetadata } from '@/lib/seo'
import { TipoLegal, TIPO_LEGAL_LABELS, SLUG_TO_TIPO } from '@/types/legal.types'
import { formatDate } from '@/lib/utils'

export const revalidate = 600

interface Props {
  params: Promise<{ tipo: string }>
}

function resolverTipo(slug: string): TipoLegal | null {
  return SLUG_TO_TIPO[slug] ?? null
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_TIPO).map((tipo) => ({ tipo }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo: slug } = await params
  const tipo = resolverTipo(slug)
  if (!tipo) return {}
  return buildMetadata({
    title: TIPO_LEGAL_LABELS[tipo],
    path: `/legal/${slug}`,
    noIndex: true,
  })
}

export default async function LegalPublicPage({ params }: Props) {
  const { tipo: slug } = await params
  const tipo = resolverTipo(slug)

  if (!tipo) notFound()

  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  let esAdmin = false
  if (session?.access_token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const json = await res.json()
        esAdmin = json.data?.tipoPerfil === 'STAFF'
      }
    } catch {}
  }

  const doc = await legalService.obtenerPublico(tipo).catch(() => null)

  if (!doc) notFound()

  return (
    <section className="py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Navegación legal */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {Object.entries(TIPO_LEGAL_LABELS).map(([t, label]) => {
            const linkSlug = Object.entries(SLUG_TO_TIPO).find(
              ([, v]) => v === t
            )?.[0]
            const isActive = t === tipo
            return (
              <Link
                key={t}
                href={`/legal/${linkSlug}`}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-azul text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Header del documento */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-azul/10 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5 text-brand-azul" />
            </div>
            {esAdmin && (
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

        {/* Contenido */}
        <div
          className="prose prose-sm prose-gray max-w-none leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{
            __html: doc.contenido.replace(/\n/g, '<br />'),
          }}
        />

        {/* Footer del documento */}
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
