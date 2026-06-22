import { Metadata } from 'next'
import { CelebracionesView } from '@/features/public/components/celebraciones/CelebracionesView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.metaTitle || 'Kiki y Lala'
    return {
      title: `Celebraciones | ${baseTitle}`,
      description: config.metaDescription || 'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala. Conoce nuestros paquetes de celebraciones privadas en Chiclayo.',
      openGraph: {
        title: `Celebraciones | ${baseTitle}`,
        description: config.metaDescription || 'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala.',
      },
    }
  } catch {
    return {
      title: 'Celebraciones | Kiki y Lala',
      description: 'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala. Conoce nuestros paquetes de celebraciones privadas en Chiclayo.',
    }
  }
}

export default function Page() {
  return <CelebracionesView />
}
