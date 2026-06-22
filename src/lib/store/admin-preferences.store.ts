import { create } from 'zustand'
import { PreferenciaAdmin } from '@/types/preferencias.types'

interface AdminPreferencesState {
  preferences: PreferenciaAdmin | null
  isLoaded: boolean
  setPreferences: (p: PreferenciaAdmin) => void
  patchLocal: (partial: Partial<PreferenciaAdmin>) => void
  clear: () => void
}

export const useAdminPreferencesStore = create<AdminPreferencesState>(
  (set) => ({
    preferences: null,
    isLoaded: false,

    setPreferences: (preferences) => set({ preferences, isLoaded: true }),

    patchLocal: (partial) =>
      set((state) =>
        state.preferences
          ? { preferences: { ...state.preferences, ...partial } }
          : state
      ),

    clear: () => set({ preferences: null, isLoaded: false }),
  })
)
