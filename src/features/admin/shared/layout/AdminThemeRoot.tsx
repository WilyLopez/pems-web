'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/lib/store/theme.store'
import { useThemeConfig } from '@/hooks/useThemeConfig'
import { useAdminPreferences } from '@/hooks/useAdminPreferences'
import { useAuth } from '@/hooks/useAuth'

function applyAdminTheme(theme: string) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export function AdminThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme)
  const { isAdmin } = useAuth()

  useAdminPreferences(isAdmin)
  useThemeConfig()

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
    <div className="admin-shell flex h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  )
}
