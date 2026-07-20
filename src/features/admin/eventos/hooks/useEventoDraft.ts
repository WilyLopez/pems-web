import { useCallback, useState } from 'react'
import { EventoDraft } from '../types'

function loadDraft(key: string): EventoDraft | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as EventoDraft) : null
  } catch {
    return null
  }
}

export function useEventoDraft(draftKey: string) {
  const [initialDraft] = useState<EventoDraft | null>(() =>
    draftKey ? loadDraft(draftKey) : null
  )

  const limpiar = useCallback(() => {
    if (draftKey) sessionStorage.removeItem(draftKey)
  }, [draftKey])

  return { initialDraft, limpiar }
}
