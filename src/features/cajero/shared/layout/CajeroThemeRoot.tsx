'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme.store'

function applyCajeroTheme(theme: string) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export function CajeroThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyCajeroTheme(theme)
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') {
        applyCajeroTheme('system')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  )
}
