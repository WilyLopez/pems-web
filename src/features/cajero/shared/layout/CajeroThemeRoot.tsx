'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme.store'
import { NotificacionesSheet } from '@/features/admin/shared/components/NotificacionesSheet'

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
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {children}
      <NotificacionesSheet />
    </div>
  )
}
