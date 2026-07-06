import { Metadata } from 'next'
import { ContactoView } from '@/features/public'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.nombreNegocio || 'Kiki y Lala'
    return {
      title: `Contacto | ${baseTitle}`,
      description:
        'Ubicación, horarios y canales de contacto de Kiki y Lala en Chiclayo.',
      openGraph: {
        title: `Contacto | ${baseTitle}`,
        description:
          'Ubicación, horarios y canales de contacto de Kiki y Lala en Chiclayo.',
      },
    }
  } catch {
    return {
      title: 'Contacto | Kiki y Lala',
      description:
        'Ubicación, horarios y canales de contacto de Kiki y Lala en Chiclayo.',
    }
  }
}

export default function Page() {
  return <ContactoView />
}
