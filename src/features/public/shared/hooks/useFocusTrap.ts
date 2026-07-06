'use client'

import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return
    const container = ref.current
    if (!container) return

    const previous = document.activeElement as HTMLElement | null

    const getFocusables = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.getClientRects().length > 0)

    const first = getFocusables()[0]
    ;(first ?? container).focus()

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const items = getFocusables()
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    container.addEventListener('keydown', handleKeydown)
    return () => {
      container.removeEventListener('keydown', handleKeydown)
      previous?.focus()
    }
  }, [active])

  return ref
}
