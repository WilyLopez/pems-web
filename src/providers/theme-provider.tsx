// src/providers/thema-providers.tsx
// Dark mode is managed by AdminThemeRoot and applies only within the admin panel.
'use client'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
