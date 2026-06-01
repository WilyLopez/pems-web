import { create } from 'zustand'

interface SesionState {
  modalExpirada: boolean
  avisoExpiracion: boolean
  segundosRestantes: number
  setModalExpirada: (v: boolean) => void
  setAvisoExpiracion: (v: boolean, segundos?: number) => void
  reset: () => void
}

export const useSesionStore = create<SesionState>((set) => ({
  modalExpirada: false,
  avisoExpiracion: false,
  segundosRestantes: 0,
  setModalExpirada: (v) => set({ modalExpirada: v }),
  setAvisoExpiracion: (v, segundos = 0) =>
    set({ avisoExpiracion: v, segundosRestantes: segundos }),
  reset: () =>
    set({ modalExpirada: false, avisoExpiracion: false, segundosRestantes: 0 }),
}))
