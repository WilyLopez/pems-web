import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminNavbar } from '@/components/layout/AdminNavbar'
import { AdminThemeRoot } from '@/components/layout/AdminThemeRoot'
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/auth/login?redirect=/admin/dashboard')
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/health/me`,
      { 
        headers: { Authorization: `Bearer ${session.access_token}` }, 
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    )

    if (res.status === 401 || res.status === 403) {
      redirect('/auth/login?redirect=/admin/dashboard')
    }

    if (res.ok) {
      const { data } = await res.json()
      if (data.tipoPerfil !== 'STAFF') {
        redirect('/cliente')
      }
    }
  } catch (error) {
    console.error('Error al validar perfil STAFF en el backend:', error)
    // No redirigimos en caso de error de red (fetch failed) para evitar bucles si el backend está caído.
    // El usuario ya está autenticado en Supabase.
  }

  return (
    <AdminThemeRoot>
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminThemeRoot>
  )
}
