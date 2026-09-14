'use client'

import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { SesionGuard } from '@/components/sesion/SesionGuard'
import { TooltipProvider } from '@/components/ui/Tooltip'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <SesionGuard />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
