import { Metadata } from 'next'
import { FaqView } from '@/features/public/components/faq/FaqView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.metaTitle || 'Kiki y Lala'
    return {
      title: `Preguntas Frecuentes | ${baseTitle}`,
      description:
        'Resolvemos tus dudas sobre nuestros servicios, reservas y eventos en Chiclayo.',
      openGraph: {
        title: `Preguntas Frecuentes | ${baseTitle}`,
        description:
          'Resolvemos tus dudas sobre nuestros servicios, reservas y eventos.',
      },
    }
  } catch {
    return {
      title: 'Preguntas Frecuentes | Kiki y Lala',
      description:
        'Resolvemos tus dudas sobre nuestros servicios, reservas y eventos.',
    }
  }
}

export default function Page() {
  return <FaqView />
}
