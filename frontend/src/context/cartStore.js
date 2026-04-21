import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// El carrito acá no es de compra directa — es de cotización.
// El cliente arma su lista y la envía como solicitud de presupuesto.
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
              i.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) return get().removeItem(productId)
        set({
          items: get().items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        })
      },

      clear: () => set({ items: [] }),

      // Totales calculados
      get total() {
        return get().items.reduce((acc, i) => acc + i.price * i.quantity, 0)
      },
      get count() {
        return get().items.reduce((acc, i) => acc + i.quantity, 0)
      },
    }),
    { name: 'torque-cart' }
  )
)
