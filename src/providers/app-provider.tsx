'use client'

import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { SesionGuard } from '@/components/sesion/SesionGuard'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider>
          {children}
          <SesionGuard />
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  )
}
