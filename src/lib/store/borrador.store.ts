import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BorradorState {
  borradores: Record<string, unknown>
  guardarBorrador: (clave: string, datos: unknown) => void
  obtenerBorrador: (clave: string) => unknown
  limpiarBorrador: (clave: string) => void
}

export const useBorradorStore = create<BorradorState>()(
  persist(
    (set, get) => ({
      borradores: {},
      guardarBorrador: (clave, datos) =>
        set((s) => ({ borradores: { ...s.borradores, [clave]: datos } })),
      obtenerBorrador: (clave) => get().borradores[clave],
      limpiarBorrador: (clave) =>
        set((s) => {
          const copia = { ...s.borradores }
          delete copia[clave]
          return { borradores: copia }
        }),
    }),
    {
      name: 'kikilala-borradores',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
