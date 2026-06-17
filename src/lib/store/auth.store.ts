import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  token: string | null
  nombre: string | null
  correo: string | null
  roles: string[]
  permisos: string[]
  tipoPerfil: 'STAFF' | 'CLIENTE' | null
  idSede: number | null
  idUsuario: number | null
  clientePerfilId: number | null
  isLoading: boolean

  setAuth: (data: { user: User; token: string }) => void
  setPermisos: (data: {
    roles: string[]
    permisos: string[]
    tipoPerfil: string
    nombre: string
    correo: string
    idUsuario?: number
    idSede?: number
    clientePerfilId?: number | null
  }) => void
  setIdSede: (id: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      nombre: null,
      correo: null,
      roles: [],
      permisos: [],
      tipoPerfil: null,
      idSede: null,
      idUsuario: null,
      clientePerfilId: null,
      isLoading: true,

      setAuth: ({ user, token }) => set({ user, token, isLoading: false }),
      setPermisos: ({ roles, permisos, tipoPerfil, nombre, correo, idUsuario, idSede, clientePerfilId }) =>
        set({
          roles,
          permisos,
          tipoPerfil: tipoPerfil as 'STAFF' | 'CLIENTE',
          nombre,
          correo,
          ...(idUsuario !== undefined && { idUsuario }),
          ...(idSede !== undefined && { idSede }),
          ...(clientePerfilId !== undefined && { clientePerfilId }),
        }),
      setIdSede: (id) => set({ idSede: id }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          nombre: null,
          correo: null,
          roles: [],
          permisos: [],
          tipoPerfil: null,
          idUsuario: null,
          clientePerfilId: null,
          isLoading: false,
        }),
    }),
    { name: 'kiki-lala-auth', partialize: (s) => ({ idSede: s.idSede }) }
  )
)
