import { Metadata } from 'next'
import { HelpCircle } from 'lucide-react'
import { FaqAccordion } from '@/components/public/faq/FaqAccordion'
import { faqService } from '@/services/faq.service'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Preguntas Frecuentes',
    description:
      'Resolvemos tus dudas sobre nuestros servicios, reservas y eventos.',
    path: '/faq',
  })
}

async function getFaqs() {
  try {
    return await faqService.listarPublico()
  } catch {
    return []
  }
}

async function getWhatsApp(): Promise<string | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/configuracion/publica`,
      { next: { revalidate: 300 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    const numero = (json.data?.whatsapp as string | undefined)?.replace(/\D/g, '')
    return numero ? `https://wa.me/${numero}` : null
  } catch {
    return null
  }
}

export default async function FaqPage() {
  const [faqs, whatsappUrl] = await Promise.all([getFaqs(), getWhatsApp()])

  return (
    <section className="py-16 px-4">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-azul/10 mb-4">
            <HelpCircle className="h-7 w-7 text-brand-azul" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            Preguntas Frecuentes
          </h1>
          <p className="text-muted-foreground">
            Todo lo que necesitas saber antes de tu visita o reserva.
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay preguntas disponibles en este momento.</p>
          </div>
        ) : (
          <FaqAccordion faqs={faqs} showSearch />
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-brand-azul/5 rounded-2xl p-8">
          <p className="font-semibold text-gray-900 mb-1">
            ¿No encontraste tu respuesta?
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Escríbenos y te responderemos a la brevedad.
          </p>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Contactar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
