import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ClienteSidebar } from '@/features/cliente/shared/layout/ClienteSidebar'
import { ClienteBottomNav } from '@/features/cliente/shared/layout/ClienteBottomNav'
import { ClienteTopBar } from '@/features/cliente/shared/layout/ClienteTopBar'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/cliente')
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/health/me`,
    { headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }, cache: 'no-store' }
  )

  if (!res.ok) {
    redirect('/auth/login?redirect=/cliente')
  }

  const { data } = await res.json()
  if (data.tipoPerfil !== 'CLIENTE') {
    redirect('/auth/login?redirect=/cliente')
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
