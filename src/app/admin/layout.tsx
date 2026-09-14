import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/features/admin/shared/layout/AdminSidebar'
import { AdminNavbar } from '@/features/admin/shared/layout/AdminNavbar'
import { AdminThemeRoot } from '@/features/admin/shared/layout/AdminThemeRoot'
import { NotificacionesSheet } from '@/features/admin/shared/components/NotificacionesSheet'
import { esRolAdmin } from '@/lib/auth-utils'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/auth/login?redirect=/admin/dashboard')
  }

  let redirectTo: string | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (res.status === 401 || res.status === 403) {
      redirectTo = '/auth/login?redirect=/admin/dashboard'
    } else if (res.ok) {
      const { data } = await res.json()
      if (data.tipoPerfil !== 'STAFF') {
        redirectTo = '/cliente'
      } else if (!esRolAdmin(data.roles ?? [])) {
        redirectTo = '/cajero'
      }
    }
  } catch (error) {
    console.error('Error al validar perfil STAFF en el backend:', error)
  }

  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <AdminThemeRoot>
      <div className="flex h-full w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <AdminNavbar />
          <main className="flex-1 overflow-auto p-6 scrollbar-thin min-w-0 bg-background">
            {children}
          </main>
        </div>
      </div>
      <NotificacionesSheet />
    </AdminThemeRoot>
  )
}
