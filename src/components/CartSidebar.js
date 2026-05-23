/**
 * CartSidebar Component
 */
export class CartSidebar {
  static renderItems(items, totalPrice) {
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');
    
    if (!itemsEl) return;

    // Total price display removed as per request

    if (items.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="empty-icon">🛍️</div>
          <p>Your cart is empty</p>
          <span>Add products to get started!</span>
        </div>`;
      if (footerEl) footerEl.style.display = 'none';
    } else {
      itemsEl.innerHTML = items.map(item => `
        <div class="cart-item">
          <img src="${item.image}" class="cart-item-img" alt="${item.name}" />
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${item.cat} (×${item.qty})</div>
          </div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          </div>
        </div>`).join('');
      if (footerEl) footerEl.style.display = 'block';
    }
  }

  static toggle(active) {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (active) {
      sidebar?.classList.add('active');
      overlay?.classList.add('active');
    } else {
      sidebar?.classList.remove('active');
      overlay?.classList.remove('active');
    }
  }
}
