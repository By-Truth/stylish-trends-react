import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: number, size: string) => void
  updateQty: (id: number, size: string, qty: number) => void
  clear: () => void
  count: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id && i.size === item.size)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.size === item.size ? { ...i, qty: i.qty + item.qty } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (id, size) =>
        set((state) => ({ items: state.items.filter((i) => !(i.id === id && i.size === size)) })),
      updateQty: (id, size, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id && i.size === size ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'st_cart_v1' }
  )
)
