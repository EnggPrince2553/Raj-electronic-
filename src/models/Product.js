/**
 * Product Model
 * Standardizes the structure of electronic inventory items.
 */
export class Product {
  constructor({ id, name, cat, image, desc, price, oldPrice, stock, badge, specs }) {
    this.id = id;
    this.name = name;
    this.cat = cat;
    this.image = image;
    this.desc = desc;
    this.price = price;
    this.oldPrice = oldPrice;
    this.stock = stock || 'in'; // 'in', 'low', 'out'
    this.badge = badge || null; // 'hot', 'new', 'popular', 'sale'
    this.specs = specs || {};
  }

  get discountPercentage() {
    if (!this.oldPrice || this.oldPrice <= this.price) return 0;
    return Math.round((1 - this.price / this.oldPrice) * 100);
  }

  get isOutOfStock() {
    return this.stock === 'out';
  }
}
