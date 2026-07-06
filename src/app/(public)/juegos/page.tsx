import { Metadata } from 'next'
import { JuegosView } from '@/features/public'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.nombreNegocio || 'Kiki y Lala'
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
  return <JuegosView />
}
