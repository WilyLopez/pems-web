'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme.store'

function applyAdminTheme(theme: string) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export function AdminThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    applyAdminTheme(theme)
  }, [theme])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') applyAdminTheme('system')
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
    <div className="flex h-screen w-screen overflow-hidden bg-background font-inter">
      {children}
    </div>
  )
}