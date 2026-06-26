import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

  return <>{children}</>
}
