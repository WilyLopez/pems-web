import { Metadata } from 'next'
import { HomeView } from '@/features/public'

const TITLE = 'Kiki y Lala - Diversión sin límites'
const DESCRIPTION =
  'El local de diversión favorito de los niños. Reservas y eventos privados en Chiclayo.'

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    keywords: 'juegos, chiclayo, diversion, niños, cumpleaños, eventos',
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      images: [],
    },
  }
}

export default function Page() {
  return <HomeView />
}
