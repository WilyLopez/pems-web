// src/app/(public)/layout.tsx

import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { DynamicFooter } from '@/components/public/footer/DynamicFooter'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'
import { legalService } from '@/services/legal.service'
import { ConfiguracionPublica } from '@/types/configuracion-publica.types'
import { ContenidoLegalResumen } from '@/types/legal.types'

async function getConfig(): Promise<ConfiguracionPublica | null> {
  try {
    return await configuracionPublicaService.obtenerPublica()
  } catch {
    return null
  }
}

async function getLegalDocs(): Promise<ContenidoLegalResumen[]> {
  try {
    return await legalService.listarPublico()
  } catch {
    return []
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, legalDocs] = await Promise.all([getConfig(), getLegalDocs()])

  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <DynamicFooter config={config} legalDocs={legalDocs} />
    </div>
  )
}
