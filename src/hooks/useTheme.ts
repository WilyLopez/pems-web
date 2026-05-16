// src/hooks/useTheme.ts

'use client'

import { useThemeStore, type Theme } from '@/lib/store/theme.store'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme } = useThemeStore()
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const calc = () => {
      if (theme === 'system') {
        setResolved(
          window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
        )
      } else {
        setResolved(theme)
      }
    }
    calc()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', calc)
    return () => mq.removeEventListener('change', calc)
  }, [theme])

  function toggle() {
    setTheme(resolved === 'dark' ? 'light' : 'dark')
  }

  return { theme, resolved, setTheme, toggle } satisfies {
    theme: Theme
    resolved: 'light' | 'dark'
    setTheme: (t: Theme) => void
    toggle: () => void
  }
}
