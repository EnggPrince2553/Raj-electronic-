/**
 * ProductCard Component
 * Renders a single product card with its relative logic.
 */
export class ProductCard {
  constructor(product, delay = 0) {
    this.product = product;
    this.delay = delay;
  }

  static getStockLabel(status) {
    const labels = {
      in: ['in', '● In Stock'],
      low: ['low', '● Low Stock'],
      out: ['out', '● Out of Stock']
    };
    return labels[status] || labels.in;
  }

  static getBadgeHtml(badge) {
    if (!badge) return '';
    const labels = {
      hot: '🔥 Hot',
      new: '✨ New',
      popular: '⭐ Popular',
      sale: '💸 Sale'
    };
    return `<div class="card-badge ${badge}">${labels[badge]}</div>`;
  }

  render() {
    const [stockClass, stockText] = ProductCard.getStockLabel(this.product.stock);
    
    return `
      <div class="product-card" data-id="${this.product.id}" style="animation-delay:${this.delay}ms" tabindex="0">
        ${ProductCard.getBadgeHtml(this.product.badge)}
        <div class="card-image-wrap">
          <img src="${this.product.image}" class="card-image" alt="${this.product.name}" />
          <div class="card-cat-strip"></div>
        </div>
        <div class="card-body">
          <div class="card-name">${this.product.name}</div>
          <div class="card-desc">${this.product.desc}</div>
        </div>
      </div>`;
  }
}
