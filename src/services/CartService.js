/**
 * Cart Service
 * Handles shopping cart operations and persists state.
 */
export class CartService {
  constructor() {
    this.cart = [];
    this.listeners = [];
  }

  get items() {
    return this.cart;
  }

  get totalItems() {
    return this.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  get totalPrice() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  addToCart(product) {
    const existing = this.cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.cart.push({ ...product, qty: 1 });
    }
    this.notify();
  }

  removeFromCart(id) {
    this.cart = this.cart.filter(i => i.id !== id);
    this.notify();
  }

  changeQty(id, delta) {
    const item = this.cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, item.qty + delta);
    if (item.qty === 0) {
      this.removeFromCart(id);
    } else {
      this.notify();
    }
  }

  clearCart() {
    this.cart = [];
    this.notify();
  }

  // Observer pattern for UI updates
  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.cart));
  }
}

export const cartService = new CartService();
