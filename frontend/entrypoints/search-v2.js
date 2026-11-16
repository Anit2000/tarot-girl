import Typed from 'typed.js';

class SearchInput extends HTMLElement {
  connectedCallback() {
    this._initSticky();
    this._initTyping();

    this.querySelector('[data-role="open-search"]')
      ?.addEventListener('click', () => {
        /** @type {SearchPopup | null} */ (document.querySelector('search-popup'))?.open();
      });
  }

  _initSticky() {
    const sectionEl = /** @type {HTMLElement | null} */ (this.closest('[id^="shopify-section-"]'));
    const headerEl = /** @type {HTMLElement | null} */ (
      document.querySelector('header-navigation')?.closest('[id^="shopify-section-"]')
    );

    if (!sectionEl || !headerEl) return;

    const setTop = () => {
      sectionEl.style.top = `${headerEl.offsetHeight}px`;
    };
    setTop();
    new ResizeObserver(setTop).observe(headerEl);
    window.addEventListener('load', setTop);

    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > lastY + 4 && y > 60) {
        sectionEl.classList.add('search-bar--hidden');
      } else if (y < lastY - 4) {
        sectionEl.classList.remove('search-bar--hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  _initTyping() {
    const target = this.querySelector('[data-role="typing-target"]');
    const configEl = this.querySelector('script[data-id="search-typing-config"]');
    if (!target || !configEl) return;

    try {
      const { strings } = JSON.parse(configEl.textContent || '{}');
      if (Array.isArray(strings) && strings.length > 0) {
        new Typed(target, {
          strings,
          loop: true,
          typeSpeed: 55,
          backSpeed: 20,
          backDelay: 1800,
          startDelay: 300,
          showCursor: false,
        });
      }
    } catch {}
  }
}
customElements.define('search-input', SearchInput);

class SearchPopup extends HTMLElement {
  connectedCallback() {
    if (!this._moved) {
      this._moved = true;
      document.body.appendChild(this);
      return;
    }

    this.panel = this.querySelector('[data-role="search-panel"]');
    /** @type {HTMLInputElement | null} */
    this.searchInput = /** @type {HTMLInputElement | null} */ (this.querySelector('#search-popup-input'));
    this.clearBtn = this.querySelector('[data-role="clear-search"]');
    this.loadingEl = this.querySelector('[data-role="search-loading"]');
    this.defaultContent = this.querySelector('[data-role="default-content"]');
    this.resultsContainer = this.querySelector('[data-role="search-results"]');
    this.emptyState = this.querySelector('[data-role="empty-state"]');

    this.querySelector('[data-role="search-cancel"]')
      ?.addEventListener('click', () => this.close());

    this.clearBtn?.addEventListener('click', () => {
      if (this.searchInput) this.searchInput.value = '';
      this.clearBtn?.classList.add('sw-hidden');
      this._showDefault();
      this.searchInput?.focus();
    });

    this.querySelectorAll('input[name="search-keyword"]').forEach(el => {
      const pill = /** @type {HTMLInputElement} */ (el);
      pill.addEventListener('change', () => {
        if (this.searchInput) {
          this.searchInput.value = pill.value;
          this.searchInput.dispatchEvent(new Event('input'));
          this.searchInput.focus();
        }
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.panel?.classList.contains('is-open')) {
        this.close();
      }
    });

    this.addEventListener('click', e => {
      const btn = /** @type {HTMLElement | null} */ (
        /** @type {HTMLElement} */ (e.target).closest('[data-role="copy-coupon"]')
      );
      if (!btn) return;
      const code = btn.dataset.code || '';
      const original = btn.textContent;
      const apply = () => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = original; }, 2000);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(apply);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        apply();
      }
    });

    this._initPredictiveSearch();
  }

  _initPredictiveSearch() {
    if (!this.searchInput) return;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let debounce;
    this.searchInput.addEventListener('input', () => {
      const q = this.searchInput?.value.trim() ?? '';
      clearTimeout(debounce);
      if (!q) {
        this._hideLoading();
        this.clearBtn?.classList.add('sw-hidden');
        this._showDefault();
        return;
      }
      this.clearBtn?.classList.add('sw-hidden');
      this._showLoading();
      debounce = setTimeout(() => this._fetchResults(q), 350);
    });
  }

  _showLoading() {
    this.loadingEl?.classList.remove('sw-hidden');
  }

  _hideLoading() {
    this.loadingEl?.classList.add('sw-hidden');
    if (this.searchInput?.value.trim()) {
      this.clearBtn?.classList.remove('sw-hidden');
    }
  }

  /** @param {string} q */
  async _fetchResults(q) {
    try {
      const res = await fetch(
        `/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=10`
      );
      const data = await res.json();
      const products = data?.resources?.results?.products ?? [];
      if (products.length > 0) {
        this._renderResults(products, q);
        this._showResults();
      } else {
        this._renderEmpty(q);
        this._showEmpty();
      }
    } catch {
      this._showDefault();
    } finally {
      this._hideLoading();
    }
  }

  /**
   * @param {Array<{url:string,title:string,image?:{src:string},price:string}>} products
   * @param {string} q
   */
  _renderResults(products, q) {
    if (!this.resultsContainer) return;
    const count = products.length;
    this.resultsContainer.innerHTML = `
      <p class="sw-text-sm sw-font-secondary sw-text-purple-500 sw-mb-4">
        ${count} result${count !== 1 ? 's' : ''} for &ldquo;${q}&rdquo;
      </p>
      <div class="sw-grid sw-grid-cols-2 lg:sw-grid-cols-3 sw-gap-3">
        ${products.map(p => this._productCardHtml(p)).join('')}
      </div>
    `;
  }

  /** @param {string} q */
  _renderEmpty(q) {
    const el = this.emptyState?.querySelector('[data-role="no-results-query"]');
    if (el) el.textContent = `No results for "${q}"`;
  }

  /** @param {Record<string, any>} product */
  _productCardHtml(product) {
    console.log(product)
    const rawSrc = product.featured_image?.url || null;
    let imgSrc = '';
    if (rawSrc) {
      // protocol-relative URLs (//cdn.shopify.com/...) must have https: prepended for URL()
      const abs = rawSrc.startsWith('//') ? `https:${rawSrc}` : rawSrc;
      try {
        const u = new URL(abs);
        u.searchParams.set('width', '120');
        imgSrc = u.toString();
      } catch {
        imgSrc = abs;
      }
    }
    const img = imgSrc
      ? `<img src="${imgSrc}" alt="${product.title}" class="sw-w-full sw-h-full sw-object-cover" loading="lazy" width="56" height="56">`
      : `<div class="sw-w-full sw-h-full sw-bg-gradient-to-br sw-from-fuchsia-500 sw-to-purple-600 sw-flex sw-items-center sw-justify-center"><span class="sw-text-white sw-text-xl">✨</span></div>`;
    return `
      <a href="${product.url}" class="sw-block sw-bg-white sw-rounded-xl sw-p-3 sw-no-underline sw-border sw-border-purple-100/60 sw-shadow-sm">
        <div class="sw-w-14 sw-h-14 sw-rounded-xl sw-overflow-hidden sw-mb-3">${img}</div>
        <p class="sw-text-purple-900 sw-font-primary sw-font-semibold sw-text-sm sw-leading-snug sw-mb-1">${product.title}</p>
        <p class="sw-text-purple-500 sw-font-secondary sw-text-xs sw-font-medium">from ${product.price}</p>
      </a>
    `;
  }

  _showDefault() {
    this.defaultContent?.classList.remove('sw-hidden');
    this.resultsContainer?.classList.add('sw-hidden');
    this.emptyState?.classList.add('sw-hidden');
  }

  _showResults() {
    this.defaultContent?.classList.add('sw-hidden');
    this.resultsContainer?.classList.remove('sw-hidden');
    this.emptyState?.classList.add('sw-hidden');
  }

  _showEmpty() {
    this.defaultContent?.classList.add('sw-hidden');
    this.resultsContainer?.classList.add('sw-hidden');
    this.emptyState?.classList.remove('sw-hidden');
  }

  open() {
    this.panel?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.searchInput?.focus(), 350);
  }

  close() {
    this.panel?.classList.remove('is-open');
    document.body.style.overflow = '';
    if (this.searchInput) this.searchInput.value = '';
    this.clearBtn?.classList.add('sw-hidden');
    this._hideLoading();
    this._showDefault();
  }
}
customElements.define('search-popup', SearchPopup);
