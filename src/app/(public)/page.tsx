import { Metadata } from 'next'
import { PublicHomeView } from '@/features/public/components/home/PublicHomeView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    return {
      title: config.metaTitle || 'Kiki y Lala - Diversión sin límites',
      description:
        config.metaDescription ||
        'El local de diversión favorito de los niños. Reservas y eventos privados en Chiclayo.',
      keywords:
        config.metaKeywords ||
        'juegos, chiclayo, diversion, niños, cumpleaños, eventos',
      openGraph: {
        title: config.openGraphTitle || config.metaTitle || 'Kiki y Lala',
        description:
          config.openGraphDescription ||
          config.metaDescription ||
          'El local de diversión favorito de los niños.',
        images: config.openGraphImageUrl
          ? [{ url: config.openGraphImageUrl }]
          : [],
      },
    }
  } catch {
    return {
      title: 'Kiki y Lala - Diversión sin límites',
      description:
        'El local de diversión favorito de los niños. Reservas y eventos privados en Chiclayo.',
    }
  }
}

export default function Page() {
  return <PublicHomeView />
}
