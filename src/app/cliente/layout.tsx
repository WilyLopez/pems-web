import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { ClienteSidebar } from '@/components/cliente/ClienteSidebar'
import { ClienteBottomNav } from '@/components/cliente/ClienteBottomNav'
import { ClienteTopBar } from '@/components/cliente/ClienteTopBar'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.rol !== 'CLIENTE') {
    redirect('/auth/login?callbackUrl=/cliente')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ClienteSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <ClienteTopBar />

        <main className="flex-1 px-4 py-6 pb-24 lg:pb-8 lg:px-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>

      <ClienteBottomNav />
    </div>
  )
}
