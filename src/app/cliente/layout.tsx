// app/(cliente)/layout.tsx

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { ClienteNavbar } from '@/components/layout/ClienteNavbar'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.rol !== 'CLIENTE') {
    redirect('/auth/login?callbackUrl=/cliente/mis-entradas')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ClienteNavbar />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-gray-400 border-t bg-white">
        &copy; {new Date().getFullYear()} Kiki y Lala &middot; Todos los
        derechos reservados
      </footer>
    </div>
  )
}
