import { Metadata } from 'next'
import { CelebracionesView } from '@/features/public'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.nombreNegocio || 'Kiki y Lala'
    return {
      title: `Celebraciones | ${baseTitle}`,
      description:
        'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala. Conoce nuestros paquetes de celebraciones privadas en Chiclayo.',
      openGraph: {
        title: `Celebraciones | ${baseTitle}`,
        description:
          'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala.',
      },
    }
  } catch {
    return {
      title: 'Celebraciones | Kiki y Lala',
      description:
        'Planifica el cumpleaños o evento de tu hijo/a en Kiki y Lala. Conoce nuestros paquetes de celebraciones privadas en Chiclayo.',
    }
  }
}

export default function Page() {
  return <CelebracionesView />
}
