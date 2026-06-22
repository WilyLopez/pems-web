import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SidebarState {
  isOpen: boolean
  mobileOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
  toggleMobile: () => void
  openMobile: () => void
  closeMobile: () => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      mobileOpen: false,
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggleMobile: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
      openMobile: () => set({ mobileOpen: true }),
      closeMobile: () => set({ mobileOpen: false }),
    }),
    {
      name: 'kiki-lala-sidebar',
      partialize: (state) => ({ isOpen: state.isOpen }),
    }
  )
)