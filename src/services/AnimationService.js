/**
 * Animation Service
 * Handles scroll-reveal animations.
 */
export class AnimationService {

  static setupScrollObserver() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, .store-status-bar, .services-section, .service-card').forEach(el => observer.observe(el));
    

  }
}
