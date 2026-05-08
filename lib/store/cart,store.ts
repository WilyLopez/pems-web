import { create } from 'zustand'

interface CartItem {
  idProducto: number
  nombre: string
  precio: number
  cantidad: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'cantidad'>) => void
  removeItem: (idProducto: number) => void
  updateCantidad: (idProducto: number, cantidad: number) => void
  clear: () => void
  total: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((s) => {
      const exists = s.items.find((i) => i.idProducto === item.idProducto)
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.idProducto === item.idProducto ? { ...i, cantidad: i.cantidad + 1 } : i
          ),
        }
      }
      return { items: [...s.items, { ...item, cantidad: 1 }] }
    }),

  removeItem: (idProducto) =>
    set((s) => ({ items: s.items.filter((i) => i.idProducto !== idProducto) })),

  updateCantidad: (idProducto, cantidad) =>
    set((s) => ({
      items:
        cantidad <= 0
          ? s.items.filter((i) => i.idProducto !== idProducto)
          : s.items.map((i) => (i.idProducto === idProducto ? { ...i, cantidad } : i)),
    })),

  clear: () => set({ items: [] }),

  subtotal: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

  total: () => get().subtotal(),
}))