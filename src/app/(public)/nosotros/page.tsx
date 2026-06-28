import { Metadata } from 'next'
import { NosotrosView } from '@/features/public/components/nosotros/NosotrosView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.metaTitle || 'Kiki y Lala'
    return {
      title: `Nosotros | ${baseTitle}`,
      description:
        config.metaDescription ||
        'Conoce nuestra historia, valores y el equipo detrás de Kiki y Lala en Chiclayo.',
      openGraph: {
        title: `Nosotros | ${baseTitle}`,
        description:
          config.metaDescription ||
          'Conoce nuestra historia, valores y el equipo detrás de Kiki y Lala.',
      },
    }
  } catch {
    return {
      title: 'Nosotros | Kiki y Lala',
      description:
        'Conoce nuestra historia, valores y el equipo detrás de Kiki y Lala.',
    }
  }
}

export default function Page() {
  return <NosotrosView />
}
