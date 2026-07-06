import '@/lib/zod-messages'
import type { Metadata } from 'next'
import { Geist, Poppins } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { configuracionPublicaService } from '@/services/configuracion-publica.service'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export async function generateMetadata(): Promise<Metadata> {
  let icon = '/logo-secundario.png'
  try {
    const config = await configuracionPublicaService.obtenerPublica()
    if (config.faviconUrl) icon = config.faviconUrl
  } catch {}

  return {
    title: { default: 'Kiki y Lala', template: '%s | Kiki y Lala' },
    description: 'Sistema de gestión de eventos Kiki y Lala',
    icons: { icon },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${poppins.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
