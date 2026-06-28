import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TipoEvento, Camino } from '@/features/cliente/shared/types'

interface WizardEventoState {
  paso: 1 | 2 | 3 | 4
  tipoEvento: TipoEvento | null
  camino: Camino
  idPaquete: number | null
  extrasSeleccionados: number[]
  otrasIdeas: string
  descripcion: string
  serviciosCotizacion: number[]
  presupuestoCliente: number | null
  fechaSel: string | null
  idTurno: number | null
  nombreNino: string
  edadCumple: number | null
  invitados: number | null
  telefonoAdicional: string

  setPaso: (paso: 1 | 2 | 3 | 4) => void
  setTipoEvento: (tipo: TipoEvento | null) => void
  setCamino: (camino: Camino) => void
  setIdPaquete: (id: number | null) => void
  toggleExtra: (id: number) => void
  setExtras: (ids: number[]) => void
  setOtrasIdeas: (v: string) => void
  setDescripcion: (v: string) => void
  toggleServicio: (id: number) => void
  setPresupuestoCliente: (v: number | null) => void
  setFecha: (v: string | null) => void
  setIdTurno: (v: number | null) => void
  setNombreNino: (v: string) => void
  setEdadCumple: (v: number | null) => void
  setInvitados: (v: number | null) => void
  setTelefonoAdicional: (v: string) => void
  reset: () => void
}

const initialState = {
  paso: 1 as const,
  tipoEvento: null,
  camino: null as Camino,
  idPaquete: null,
  extrasSeleccionados: [] as number[],
  otrasIdeas: '',
  descripcion: '',
  serviciosCotizacion: [] as number[],
  presupuestoCliente: null,
  fechaSel: null,
  idTurno: null,
  nombreNino: '',
  edadCumple: null,
  invitados: null,
  telefonoAdicional: '',
}

export const useWizardEventoStore = create<WizardEventoState>()(
  persist(
    (set) => ({
      ...initialState,

      setPaso: (paso) => set({ paso }),
      setTipoEvento: (tipoEvento) => set({ tipoEvento }),
      setCamino: (camino) => set({ camino }),
      setIdPaquete: (idPaquete) => set({ idPaquete }),
      toggleExtra: (id) =>
        set((s) => ({
          extrasSeleccionados: s.extrasSeleccionados.includes(id)
            ? s.extrasSeleccionados.filter((x) => x !== id)
            : [...s.extrasSeleccionados, id],
        })),
      setExtras: (extrasSeleccionados) => set({ extrasSeleccionados }),
      setOtrasIdeas: (otrasIdeas) => set({ otrasIdeas }),
      setDescripcion: (descripcion) => set({ descripcion }),
      toggleServicio: (id) =>
        set((s) => ({
          serviciosCotizacion: s.serviciosCotizacion.includes(id)
            ? s.serviciosCotizacion.filter((x) => x !== id)
            : [...s.serviciosCotizacion, id],
        })),
      setPresupuestoCliente: (presupuestoCliente) =>
        set({ presupuestoCliente }),
      setFecha: (fechaSel) => set({ fechaSel }),
      setIdTurno: (idTurno) => set({ idTurno }),
      setNombreNino: (nombreNino) => set({ nombreNino }),
      setEdadCumple: (edadCumple) => set({ edadCumple }),
      setInvitados: (invitados) => set({ invitados }),
      setTelefonoAdicional: (telefonoAdicional) => set({ telefonoAdicional }),
      reset: () => set(initialState),
    }),
    {
      name: 'kikilala-wizard-evento',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
