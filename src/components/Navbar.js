/**
 * Navbar Component
 */
export class Navbar {
  constructor() {
    this.container = document.getElementById('navbar');
  }

  static setupScrollEffect() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  // Navbar is mostly static in HTML, but we can manage badges/counts here
  static updateCartCount(count) {
    const countEl = document.getElementById('cartCount');
    if (countEl) countEl.textContent = count;
  }
}
