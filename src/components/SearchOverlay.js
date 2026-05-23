/**
 * SearchOverlay Component
 */
export class SearchOverlay {
  static renderResults(results, query) {
    const resultsEl = document.getElementById('searchResults');
    if (!resultsEl) return;

    if (results.length === 0) {
      resultsEl.innerHTML = query ? `<div style="color:var(--text-dim);padding:20px;text-align:center">No results found for "${query}"</div>` : '';
      return;
    }

    resultsEl.innerHTML = results.map(p => `
      <div class="search-result-item" data-id="${p.id}">
        <img src="${p.image}" class="search-result-img" alt="" />
        <div>
          <div class="search-result-name">${p.name}</div>
          <div class="search-result-price">${p.cat}</div>
        </div>
      </div>`).join('');
  }

  static toggle(active) {
    const overlay = document.getElementById('searchOverlay');
    const input = document.getElementById('searchInput');
    if (active) {
      overlay?.classList.add('active');
      input?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      overlay?.classList.remove('active');
      if (input) input.value = '';
      const resultsEl = document.getElementById('searchResults');
      if (resultsEl) resultsEl.innerHTML = '';
      document.body.style.overflow = '';
    }
  }
}
