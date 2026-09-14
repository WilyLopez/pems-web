import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CajeroThemeRoot } from '@/features/cajero/shared/layout/CajeroThemeRoot'
import { CajeroSidebar } from '@/features/cajero/shared/layout/CajeroSidebar'
import { CajeroTopBar } from '@/features/cajero/shared/layout/CajeroTopBar'
import { CajeroBottomNav } from '@/features/cajero/shared/layout/CajeroBottomNav'

export default async function CajeroLayout({
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
    redirect('/auth/login?redirect=/cajero')
  }

  let redirectTo: string | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (res.status === 401 || res.status === 403) {
      redirectTo = '/auth/login?redirect=/cajero'
    } else if (res.ok) {
      const { data } = await res.json()
      if (data.tipoPerfil !== 'STAFF') {
        redirectTo = '/cliente'
      }
    }
  } catch (error) {
    console.error('Error al validar perfil STAFF en el backend:', error)
  }

  if (redirectTo) {
    redirect(redirectTo)
  }

  return (
    <CajeroThemeRoot>
      <CajeroSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <CajeroTopBar />

        <main className="flex-1 px-4 py-6 pb-24 lg:pb-8 lg:px-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      <CajeroBottomNav />
    </CajeroThemeRoot>
  )
}
