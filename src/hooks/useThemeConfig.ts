// src/hooks/useThemeConfig.ts

'use client'

import { useEffect } from 'react'
import { useAdminPreferencesStore } from '@/lib/store/admin-preferences.store'
import { useThemeStore } from '@/lib/store/theme.store'

const FONT_SIZE_MAP = { SMALL: '13px', NORMAL: '15px', LARGE: '17px' }
const BORDER_RADIUS_MAP = { SMALL: '4px', NORMAL: '8px', LARGE: '16px' }

export function useThemeConfig() {
  const preferences = useAdminPreferencesStore((s) => s.preferences)
  const { setTheme } = useThemeStore()

  useEffect(() => {
    if (!preferences) return

    const root = document.documentElement

    // Sync tema to Zustand theme store (handles dark class)
    const temaMap = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' } as const
    setTheme(temaMap[preferences.tema])

    // CSS custom properties
    if (preferences.colorPrimario)
      root.style.setProperty('--color-primary', preferences.colorPrimario)
    if (preferences.colorSecundario)
      root.style.setProperty('--color-secondary', preferences.colorSecundario)
    if (preferences.colorSidebar)
      root.style.setProperty('--color-sidebar', preferences.colorSidebar)
    if (preferences.colorAcento)
      root.style.setProperty('--color-accent', preferences.colorAcento)

    root.style.setProperty(
      '--font-base-size',
      FONT_SIZE_MAP[preferences.tamanioFuente]
    )
    root.style.setProperty(
      '--border-radius-base',
      BORDER_RADIUS_MAP[preferences.radiosBordes]
    )
    root.style.setProperty('--font-admin', preferences.tipografia.toLowerCase())

    if (preferences.reducirAnimaciones) {
      root.style.setProperty('--transition-duration', '0ms')
    } else {
      root.style.removeProperty('--transition-duration')
    }

    if (preferences.aumentarEspaciado) {
      root.style.setProperty('--spacing-factor', '1.25')
    } else {
      root.style.removeProperty('--spacing-factor')
    }

    if (preferences.altoContraste) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    if (preferences.cursorGrande) {
      root.classList.add('large-cursor')
    } else {
      root.classList.remove('large-cursor')
    }
  }, [preferences, setTheme])
}
