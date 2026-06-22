'use client'

import { AuthProvider } from './auth-provider'
import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { SesionGuard } from '@/components/sesion/SesionGuard'
import { TooltipProvider } from '@/components/ui/Tooltip'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <SesionGuard />
          </TooltipProvider>
        </ThemeProvider>
      </QueryProvider>
    </AuthProvider>
  )
}
