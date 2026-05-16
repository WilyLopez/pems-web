import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  idSede: number | null
  setIdSede: (id: number) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      idSede: null,
      setIdSede: (id) => set({ idSede: id }),
      clear: () => set({ idSede: null }),
    }),
    { name: 'Kiki y Lala-auth' }
  )
)
