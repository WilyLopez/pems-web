import { ClienteSidebar } from '@/features/cliente/shared/layout/ClienteSidebar'
import { ClienteBottomNav } from '@/features/cliente/shared/layout/ClienteBottomNav'
import { ClienteTopBar } from '@/features/cliente/shared/layout/ClienteTopBar'

export default function ClientePortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
