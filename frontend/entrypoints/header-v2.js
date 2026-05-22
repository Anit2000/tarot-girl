class HeaderNavigation extends HTMLElement {

  constructor() {

    super();

    this.mobileToggle = this.querySelector(
      '[data-role="mobile-toggle"]'
    );

    this.mobileOverlay = this.querySelector(
      '[data-role="mobile-overlay"]'
    );

    this.mobilePanel = this.querySelector(
      '[data-role="mobile-panel"]'
    );

    this.mobileBackdrop = this.querySelector(
      '[data-role="backdrop"]'
    );

    this.mobileClose = this.querySelector(
      '[data-role="mobile-close"]'
    );

    this.mobileLinks = this.querySelectorAll(
      '[data-mobile-link]'
    );

  }

  connectedCallback() {

    this.initializeEvents();

  }

  initializeEvents() {

    if (this.mobileToggle) {

      this.mobileToggle.addEventListener(
        'click',
        this.openMobileMenu.bind(this)
      );

    }

    if (this.mobileClose) {

      this.mobileClose.addEventListener(
        'click',
        this.closeMobileMenu.bind(this)
      );

    }

    if (this.mobileBackdrop) {

      this.mobileBackdrop.addEventListener(
        'click',
        this.closeMobileMenu.bind(this)
      );

    }

    this.mobileLinks.forEach((link) => {

      link.addEventListener(
        'click',
        () => {

          this.closeMobileMenu();

        }
      );

    });

  }

  openMobileMenu() {

    this.mobileOverlay.classList.remove(
      'sw-pointer-events-none'
    );

    this.mobileBackdrop.classList.remove(
      'sw-opacity-0'
    );

    this.mobileBackdrop.classList.add(
      'sw-opacity-100'
    );

    this.mobilePanel.classList.remove(
      'sw-translate-x-full'
    );

    this.mobilePanel.classList.add(
      'sw-translate-x-0'
    );

    document.body.style.overflow = 'hidden';

  }

  closeMobileMenu() {

    this.mobileBackdrop.classList.remove(
      'sw-opacity-100'
    );

    this.mobileBackdrop.classList.add(
      'sw-opacity-0'
    );

    this.mobilePanel.classList.remove(
      'sw-translate-x-0'
    );

    this.mobilePanel.classList.add(
      'sw-translate-x-full'
    );

    setTimeout(() => {

      this.mobileOverlay.classList.add(
        'sw-pointer-events-none'
      );

    }, 300);

    document.body.style.overflow = '';

  }

}

customElements.define(
  'header-navigation',
  HeaderNavigation
);