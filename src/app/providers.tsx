'use client'

import { AppProvider } from '@/providers/app-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>
}
