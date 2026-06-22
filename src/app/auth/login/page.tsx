import { Suspense } from 'react'
import { LoginView } from '@/features/auth/components/views/LoginView'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  )
}
