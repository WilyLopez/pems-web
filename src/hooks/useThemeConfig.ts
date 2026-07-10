// src/hooks/useThemeConfig.ts

'use client'

import { useEffect } from 'react'
import { useAdminPreferencesStore } from '@/lib/store/admin-preferences.store'
import { useThemeStore } from '@/lib/store/theme.store'
import {
  TIPOGRAFIA_FAMILY_MAP,
  FONT_SIZE_MAP,
} from '@/features/admin/preferencias/constants'

export function useThemeConfig() {
  const preferences = useAdminPreferencesStore((s) => s.preferences)
  const { setTheme } = useThemeStore()

  useEffect(() => {
    if (!preferences) return

    const root = document.documentElement

    const temaMap = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' } as const
    setTheme(temaMap[preferences.tema])

    root.style.setProperty(
      '--font-admin',
      TIPOGRAFIA_FAMILY_MAP[preferences.tipografia] ?? TIPOGRAFIA_FAMILY_MAP.SYSTEM
    )
    root.style.setProperty(
      '--font-base-size',
      FONT_SIZE_MAP[preferences.tamanioFuente]
    )
  }, [preferences, setTheme])
}
