/**
 * Main Entry Point
 * Orchestrates the application logic and component lifecycle.
 */

import { productService } from './services/ProductService.js';
import { AnimationService } from './services/AnimationService.js';

import { Navbar } from './components/Navbar.js';
import { ProductCard } from './components/ProductCard.js';
import { ServiceCard } from './components/ServiceCard.js';
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
      this.setupModal();
      this.setupSearch();
      this.setupBookingModal();
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

  renderAll() {
    this.renderProducts();
    this.renderServices();
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

  // ===================== CARD EVENTS =====================
  bindCardEvents() {
    document.querySelectorAll('.btn-info, .card-image-wrap, .card-name').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        const card = el.closest('.product-card');
        if (card) this.openModal(parseInt(card.dataset.id));
      });
    });
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

