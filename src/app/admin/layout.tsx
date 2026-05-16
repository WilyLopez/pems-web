import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth.config'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminNavbar } from '@/components/layout/AdminNavbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.rol !== 'ADMIN') {
    redirect('/auth/login?callbackUrl=/admin/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-inter">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
