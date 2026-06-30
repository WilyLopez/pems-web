import { Metadata } from 'next'
import { legalService } from '@/services/legal.service'
import { buildMetadata } from '@/lib/seo'
import { LegalDocumentView } from '@/features/public/components/legal/LegalDocumentView'

export const revalidate = 600

interface Props {
  params: Promise<{ tipo: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tipo: slug } = await params
  const doc = await legalService.obtenerPublicoPorSlug(slug).catch(() => null)
  return buildMetadata({
    title: doc?.titulo ?? 'Documento legal',
    path: `/legal/${slug}`,
    noIndex: true,
  })
}

export default function LegalPublicPage() {
  return <LegalDocumentView />
}
