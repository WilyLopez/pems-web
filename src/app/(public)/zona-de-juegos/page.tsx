import { Metadata } from 'next'
import { ZonaDeJuegosView } from '@/features/public/components/zona-de-juegos/ZonaDeJuegosView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.metaTitle || 'Kiki y Lala'
    return {
      title: `Zona de Juegos | ${baseTitle}`,
      description:
        'Conoce nuestras tarifas, horarios, atracciones y reglamento de seguridad para la zona de juegos en Chiclayo.',
      openGraph: {
        title: `Zona de Juegos | ${baseTitle}`,
        description:
          'Conoce nuestras tarifas, horarios, atracciones y reglamento de seguridad.',
      },
    }
  } catch {
    return {
      title: 'Zona de Juegos | Kiki y Lala',
      description:
        'Conoce nuestras tarifas, horarios, atracciones y reglamento de seguridad.',
    }
  }
}

export default function Page() {
  return <ZonaDeJuegosView />
}
