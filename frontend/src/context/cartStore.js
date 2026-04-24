import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const items = get().items
        const existing = items.find((i) => i.id === product.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'torque-cart' }
  )
)

// Selectores derivados — se usan así en los componentes:
// const count = useCartStore(selectCount)
// const total = useCartStore(selectTotal)
export const selectCount = (state) =>
  state.items.reduce((acc, i) => acc + i.quantity, 0)

export const selectTotal = (state) =>
  state.items.reduce((acc, i) => acc + i.price * i.quantity, 0)