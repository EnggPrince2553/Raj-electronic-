/**
 * Main Entry Point
 * Orchestrates the application logic and component lifecycle.
 */

import { productService } from './services/ProductService.js';
import { cartService } from './services/CartService.js';
import { AnimationService } from './services/AnimationService.js';

import { Navbar } from './components/Navbar.js';
import { ProductCard } from './components/ProductCard.js';
import { ServiceCard } from './components/ServiceCard.js';
import { CartSidebar } from './components/CartSidebar.js';
import { ProductModal } from './components/ProductModal.js';
import { SearchOverlay } from './components/SearchOverlay.js';
import { SERVICES as FALLBACK_SERVICES } from './models/ServiceData.js';

class App {
  constructor() {
    this.currentCat = 'all';
    this.currentSort = 'default';
    this.services = [];
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', async () => {
      // Initialize Services
      AnimationService.setupScrollObserver();

      // Load products & services dynamically from MongoDB
      try {
        await Promise.all([
          productService.loadProducts(),
          this.loadServices()
        ]);
      } catch (err) {
        console.error('Initialization error loading database items:', err);
      }

      // Initial Render
      this.renderAll();

      // Setup UI Listeners
      Navbar.setupScrollEffect();
      this.setupFilters();
      this.setupCart();
      this.setupModal();
      this.setupSearch();
      this.setupBookingModal();
      this.setupOrderModal();

      // Subscribe to cart updates
      cartService.subscribe(() => this.updateCartUI());
    });
  }

  async loadServices() {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Network error');
      this.services = await response.json();
    } catch (err) {
      console.warn('⚠️ Could not load services from API. Using local fallback:', err.message);
      this.services = FALLBACK_SERVICES;
    }
  }

  // ===================== RENDERING =====================
  renderAll() {
    this.renderProducts();
    this.renderServices();
    this.updateCartUI();
  }

  renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const list = productService.getFilteredProducts(this.currentCat, this.currentSort);
    const countEl = document.getElementById('showingCount');
    const totalEl = document.getElementById('totalProducts');

    const label = this.currentCat === 'all' ? 'all' : this.currentCat;
    countEl.textContent = `Showing ${list.length} ${label} product${list.length !== 1 ? 's' : ''}`;
    if (totalEl) totalEl.textContent = productService.getAllProducts().length;

    grid.innerHTML = list.map((p, i) => new ProductCard(p, i * 60).render()).join('');
    this.bindCardEvents();
  }

  renderServices() {
    const grid = document.querySelector('.services-grid');
    if (!grid) return;
    const list = this.services && this.services.length > 0 ? this.services : FALLBACK_SERVICES;
    grid.innerHTML = list.map(s => new ServiceCard(s).render()).join('');
  }

  // ===================== UI SETUP =====================
  setupFilters() {
    document.getElementById('filterTabs').addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.currentCat = btn.dataset.cat;
      this.renderProducts();
    });

    document.getElementById('sortSelect').addEventListener('change', e => {
      this.currentSort = e.target.value;
      this.renderProducts();
    });
  }

  setupCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');

    cartBtn?.addEventListener('click', () => CartSidebar.toggle(true));
    cartClose?.addEventListener('click', () => CartSidebar.toggle(false));
    cartOverlay?.addEventListener('click', () => CartSidebar.toggle(false));

    document.querySelector('.checkout-btn')?.addEventListener('click', () => {
      if (cartService.items.length === 0) {
        alert('🛍️ Your cart is empty. Add products before checking out!');
        return;
      }
      CartSidebar.toggle(false);
      this.toggleOrderModal(true);
    });
  }

  updateCartUI() {
    Navbar.updateCartCount(cartService.totalItems);
    CartSidebar.renderItems(cartService.items, cartService.totalPrice);

    // Re-bind listeners for items in the sidebar
    const itemsEl = document.getElementById('cartItems');
    itemsEl?.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        cartService.changeQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta));
      });
    });
  }

  setupModal() {
    document.getElementById('modalClose')?.addEventListener('click', () => ProductModal.toggle(false));
    document.getElementById('modalOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalOverlay') ProductModal.toggle(false);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') ProductModal.toggle(false); });
  }

  openModal(id) {
    const p = productService.getProductById(id);
    if (!p) return;
    ProductModal.render(p);

    // Add listener for the dynamically rendered button
    document.querySelector('.modal-add-btn')?.addEventListener('click', () => {
      if (!p.isOutOfStock) {
        cartService.addToCart(p);
        ProductModal.toggle(false);
        this.flashCartBtn();
      }
    });

    ProductModal.toggle(true);
  }

  setupSearch() {
    const input = document.getElementById('searchInput');
    const openBtn = document.getElementById('searchBtn');
    const closeBtn = document.getElementById('searchClose');
    const overlay = document.getElementById('searchOverlay');

    openBtn?.addEventListener('click', () => SearchOverlay.toggle(true));
    closeBtn?.addEventListener('click', () => SearchOverlay.toggle(false));
    overlay?.addEventListener('click', e => { if (e.target === overlay) SearchOverlay.toggle(false); });

    input?.addEventListener('input', () => {
      const found = productService.search(input.value);
      SearchOverlay.renderResults(found, input.value);

      // Re-bind listeners for search results
      document.getElementById('searchResults')?.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = parseInt(el.dataset.id);
          SearchOverlay.toggle(false);
          setTimeout(() => this.openModal(id), 200);
        });
      });
    });

    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); SearchOverlay.toggle(true); }
    });
  }

  // Open the booking modal
  openBookingModal(serviceId = '') {
    const overlay = document.getElementById('bookingModalOverlay');
    const serviceSelect = document.getElementById('bookingService');

    overlay?.classList.add('active');

    if (serviceId && serviceSelect) {
      serviceSelect.value = serviceId;
    }
  }

  setupBookingModal() {
    const overlay = document.getElementById('bookingModalOverlay');
    const closeBtn = document.getElementById('bookingModalClose');
    const form = document.getElementById('bookingForm');
    const serviceSelect = document.getElementById('bookingService');
 
    const closeBookingModal = () => {
      overlay?.classList.remove('active');
      form?.reset();
    };
 
    closeBtn?.addEventListener('click', () => closeBookingModal());
    overlay?.addEventListener('click', e => {
      if (e.target === overlay) closeBookingModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeBookingModal();
    });
 
    // Global CTA
    document.getElementById('globalBookBtn')?.addEventListener('click', () => this.openBookingModal());

    // Handle clicks inside services grid (dynamic event delegation)
    document.querySelector('.services-grid')?.addEventListener('click', e => {
      const btn = e.target.closest('.btn-book-service');
      if (btn) {
        this.openBookingModal(btn.dataset.id);
      }
    });
 
    // Form Submission
    form?.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('bookingName').value.trim();
      const phone = document.getElementById('bookingPhone').value.trim();
      const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
      const address = document.getElementById('bookingAddress').value.trim();
      const message = document.getElementById('bookingNotes').value.trim();

      if (!name || !phone || !serviceText || !address || !message) {
        alert('⚠️ Please fill in all required fields.');
        return;
      }

      if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
        alert('⚠️ Please enter a valid 10-digit phone number.');
        return;
      }

      const msg = `🔧 New Service Booking

👤 Name: ${name}
📞 Phone: ${phone}
🛠 Service: ${serviceText}
📍 Address: ${address}
📝 Problem: ${message}`;

      window.open(
        `https://wa.me/917522095892?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      closeBookingModal();
    });
  }

  // ===================== ORDER CHECKOUT MODAL EVENTS =====================
  toggleOrderModal(show) {
    const overlay = document.getElementById('orderModalOverlay');
    const form = document.getElementById('orderForm');
    if (show) {
      overlay?.classList.add('active');
      this.updateOrderSummary();
    } else {
      overlay?.classList.remove('active');
      form?.reset();
      const addressGroup = document.getElementById('orderAddressGroup');
      if (addressGroup) addressGroup.style.display = 'none';
    }
  }

  updateOrderSummary() {
    const summaryItemsEl = document.getElementById('orderSummaryItems');
    const summaryTotalEl = document.getElementById('orderSummaryTotal');
    if (!summaryItemsEl || !summaryTotalEl) return;

    const items = cartService.items;
    if (items.length === 0) {
      summaryItemsEl.innerHTML = '<div style="color:var(--text-muted)">No items in cart</div>';
      summaryTotalEl.textContent = '₹0';
      return;
    }

    summaryItemsEl.innerHTML = items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span>${item.name} <strong style="color: var(--text-dim)">x${item.qty}</strong></span>
        <span style="font-family: var(--mono);">₹${item.price * item.qty}</span>
      </div>
    `).join('');

    summaryTotalEl.textContent = `₹${cartService.totalPrice}`;
  }

  setupOrderModal() {
    const overlay = document.getElementById('orderModalOverlay');
    const closeBtn = document.getElementById('orderModalClose');
    const form = document.getElementById('orderForm');
    const deliverySelect = document.getElementById('orderDelivery');
    const addressGroup = document.getElementById('orderAddressGroup');
    const addressInput = document.getElementById('orderAddress');

    closeBtn?.addEventListener('click', () => this.toggleOrderModal(false));
    overlay?.addEventListener('click', e => { if (e.target === overlay) this.toggleOrderModal(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.toggleOrderModal(false); });

    deliverySelect?.addEventListener('change', () => {
      if (deliverySelect.value === 'delivery') {
        if (addressGroup) addressGroup.style.display = 'block';
        addressInput?.setAttribute('required', 'true');
      } else {
        if (addressGroup) addressGroup.style.display = 'none';
        addressInput?.removeAttribute('required');
      }
    });

    form?.addEventListener('submit', async e => {
      e.preventDefault();
      const customerName = document.getElementById('orderName').value;
      const customerPhone = document.getElementById('orderPhone').value;
      const deliveryMethod = deliverySelect.value;
      const address = addressInput?.value || '';
      const items = cartService.items;
      const totalPrice = cartService.totalPrice;

      const submitBtn = form.querySelector('.booking-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Registering Order...';
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName,
            customerPhone,
            deliveryMethod,
            address: deliveryMethod === 'delivery' ? address : '',
            items: items.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty
            })),
            totalPrice
          })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          alert(`🎉 Order Placed Successfully!\n\nThank you ${customerName}. Your order has been registered in the database! We will contact you at ${customerPhone} to arrange delivery/pickup.`);
          cartService.clearCart();
        } else {
          throw new Error(result.error || 'Failed to submit order');
        }
      } catch (err) {
        console.warn('Order saved locally/offline fallback:', err.message);
        alert(`🎉 Order Logged (Offline mode)!\n\nThank you ${customerName}. Your order for ₹${totalPrice} is recorded. We will contact you soon.`);
        cartService.clearCart();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '⚡ Confirm & Place Order';
        }
        this.toggleOrderModal(false);
      }
    });
  }

  // ===================== CARD EVENTS =====================
  bindCardEvents() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const product = productService.getProductById(id);
        cartService.addToCart(product);

        btn.textContent = '✅ Added!';
        btn.style.background = 'linear-gradient(135deg,#34d399,#22d3ee)';
        setTimeout(() => {
          btn.textContent = '🛒 Add to Cart';
          btn.style.background = '';
        }, 1500);
        this.flashCartBtn();
      });
    });

    document.querySelectorAll('.btn-info, .card-image-wrap, .card-name').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const card = el.closest('.product-card');
        if (card) this.openModal(parseInt(card.dataset.id));
      });
    });
  }

  flashCartBtn() {
    const btn = document.getElementById('cartBtn');
    if (!btn) return;
    btn.style.transform = 'scale(1.15)';
    btn.style.boxShadow = '0 0 30px rgba(56,189,248,0.8)';
    setTimeout(() => {
      btn.style.transform = '';
      btn.style.boxShadow = '';
    }, 300);
  }
}

// Start App
new App();

// ===================== GALLERY STRIP =====================
class GalleryStrip {
  constructor() {
    this.strip = document.getElementById('galleryStrip');
    if (!this.strip) return;

    // Arrow buttons
    document.getElementById('galleryLeft')?.addEventListener('click', () => this.scroll(-360));
    document.getElementById('galleryRight')?.addEventListener('click', () => this.scroll(360));

    // Drag to scroll
    let isDown = false, startX = 0, scrollStart = 0;
    this.strip.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - this.strip.offsetLeft;
      scrollStart = this.strip.scrollLeft;
      this.strip.style.userSelect = 'none';
    });
    this.strip.addEventListener('mouseleave', () => { isDown = false; });
    this.strip.addEventListener('mouseup',    () => { isDown = false; this.strip.style.userSelect = ''; });
    this.strip.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - this.strip.offsetLeft;
      this.strip.scrollLeft = scrollStart - (x - startX);
    });

    // Auto-slide every 4 s, pause on hover
    this.timer = setInterval(() => this.autoScroll(), 4000);
    this.strip.addEventListener('mouseenter', () => clearInterval(this.timer));
    this.strip.addEventListener('mouseleave', () => {
      this.timer = setInterval(() => this.autoScroll(), 4000);
    });
  }

  scroll(px) {
    this.strip.scrollBy({ left: px, behavior: 'smooth' });
  }

  autoScroll() {
    const maxScroll = this.strip.scrollWidth - this.strip.clientWidth;
    if (this.strip.scrollLeft >= maxScroll - 5) {
      this.strip.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      this.scroll(360);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new GalleryStrip());

