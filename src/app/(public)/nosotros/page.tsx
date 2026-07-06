import { Metadata } from 'next'
import { NosotrosView } from '@/features/public'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.nombreNegocio || 'Kiki y Lala'
    return {
      title: `Nosotros | ${baseTitle}`,
      description:
        'Conoce nuestra historia, valores y el equipo detrás de Kiki y Lala en Chiclayo.',
      openGraph: {
        title: `Nosotros | ${baseTitle}`,
        description:
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
