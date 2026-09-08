import { create } from 'zustand';

// Store for managing the POS cart state on the client side
export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product) => set((state) => {
    const existingItem = state.items.find((item) => item.product_id === product.id);
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    
    return {
      items: [
        ...state.items,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        }
      ]
    };
  }),
  
  removeItem: (productId) => set((state) => ({
    items: state.items.filter((item) => item.product_id !== productId)
  })),
  
  incrementQuantity: (productId) => set((state) => ({
    items: state.items.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  })),
  
  decrementQuantity: (productId) => set((state) => ({
    items: state.items.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: Math.max(1, item.quantity - 1) } // Prevent quantity < 1
        : item
    )
  })),

  updateQuantity: (productId, newQuantity) => set((state) => ({
    items: state.items.map((item) =>
      item.product_id === productId
        ? { ...item, quantity: Math.max(1, parseInt(newQuantity) || 1) }
        : item
    )
  })),

  updatePrice: (productId, newPrice) => set((state) => ({
    items: state.items.map((item) =>
      item.product_id === productId
        ? { ...item, price: Math.max(0, parseFloat(newPrice) || 0) }
        : item
    )
  })),
  

  
  clearCart: () => set({ items: [] }),

  // Helpers
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  
  getSubtotal: () => get().items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0)
}));
