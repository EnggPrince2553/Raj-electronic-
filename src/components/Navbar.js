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

}
