/**
 * ServiceCard Component
 * Renders a card for technical services.
 */
export class ServiceCard {
  constructor(serviceData) {
    this.service = serviceData;
  }

  render() {
    return `
      <div class="service-card" data-id="${this.service.id}">
        <div class="service-icon">${this.service.icon}</div>
        <h3 class="service-name">${this.service.name}</h3>
        <p class="service-text">${this.service.text}</p>
        <ul class="service-list">
          ${this.service.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <button class="btn-book-service" data-id="${this.service.id}" data-name="${this.service.name}">
          📅 Book Service
        </button>
      </div>`;
  }
}
