import { ProductCard } from './ProductCard.js';

/**
 * ProductModal Component
 */
export class ProductModal {
  static render(product) {
    const modalContent = document.getElementById('modalContent');
    if (!modalContent) return;

    const [stockClass, stockText] = ProductCard.getStockLabel(product.stock);
    const discount = product.discountPercentage;

    modalContent.innerHTML = `
      <div class="modal-hero" style="background-image: url('${product.image}');"></div>
      <div class="modal-body">
        <div class="modal-title">${product.name}</div>
        <div class="modal-subtitle">${product.desc}</div>
        <div class="modal-price-row">
          <div class="card-stock ${stockClass}" style="margin-left:auto">${stockText}</div>
        </div>
        <div class="modal-specs-title">📋 Technical Specifications</div>
        <div class="spec-grid">
          ${Object.entries(product.specs).map(([k, v]) => `
            <div class="spec-row">
              <span class="spec-key">${k}</span>
              <span class="spec-val">${v}</span>
            </div>`).join('')}
        </div>
        <div class="modal-actions">
          <button class="modal-add-btn" ${product.isOutOfStock ? 'disabled' : ''} data-id="${product.id}">
            ${product.isOutOfStock ? '❌ Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>`;
  }

  static toggle(active) {
    const overlay = document.getElementById('modalOverlay');
    if (active) {
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
}
