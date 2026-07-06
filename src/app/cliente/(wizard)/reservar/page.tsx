import { Metadata } from 'next'
import { Suspense } from 'react'
import { ReservarView } from '@/features/cliente/reservar/ReservarView'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'
import { Loader2 } from 'lucide-react'

const DESCRIPTION =
  'Reserva tu entrada a la zona de juegos de Kiki y Lala de forma rápida y segura en Chiclayo.'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    const baseTitle = config.nombreNegocio || 'Kiki y Lala'
    return {
      title: `Reservar Entrada | ${baseTitle}`,
      description: DESCRIPTION,
      openGraph: {
        title: `Reservar Entrada | ${baseTitle}`,
        description: DESCRIPTION,
      },
    }
  } catch {
    return {
      title: 'Reservar Entrada | Kiki y Lala',
      description: DESCRIPTION,
    }
  }
}

function ReservarFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 text-brand-azul animate-spin" />
        <p className="text-sm font-semibold text-gray-500">
          Cargando el asistente de reserva...
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<ReservarFallback />}>
      <ReservarView />
    </Suspense>
  )
}
