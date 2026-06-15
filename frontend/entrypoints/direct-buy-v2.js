class DirectBuy extends HTMLElement {
  constructor() {
    super();
    this.formWrapper = this.querySelector('[data-role="form-wrapper"]');
  }

  connectedCallback() {
    if (this.checkIfADirectBuy()) this.showPopup();
  }

  async getBuyNowButton() {
    try {
      const query = new URLSearchParams(window.location.search);
      const productHandle = query.get("handle");
      const variantId = query.get("variantId");

      const request = await fetch(`/products/${productHandle}?view=buyNow&variantId=${variantId}`);
      this.formWrapper.innerHTML = await request.text();

      const btn = await this.waitForButton();
      await this.waitForRazorpay();

      if (!btn) throw new Error("no button found here");

      btn.click();
      this.hidePopup();
    } catch (err) {
      console.warn("Failed to get buy now button reason --> " + err.message);
    }
  }

  waitForRazorpay() {
    if (this.razorpayPoll) clearInterval(this.razorpayPoll);

    return new Promise((resolve, reject) => {
      this.razorpayPoll = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(this.razorpayPoll);
          resolve(true);
        }
      }, 300);

      setTimeout(() => {
        clearInterval(this.razorpayPoll);
        reject(new Error("Razorpay never loaded"));
      }, 5000);
    });
  }

  waitForButton() {
    return new Promise((resolve, reject) => {
      const existing = this.formWrapper.querySelector("shopify-buy-it-now-button button");
      if (existing) return resolve(existing);

      const observer = new MutationObserver(() => {
        const btn = this.formWrapper.querySelector("shopify-buy-it-now-button button");
        if (btn) {
          observer.disconnect();
          resolve(btn);
        }
      });

      observer.observe(this.formWrapper, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Buy now button never appeared"));
      }, 5000);
    });
  }

  checkIfADirectBuy() {
    const query = new URLSearchParams(window.location.search);
    const isDirectBuy = query.get("direct_buy");
    const variantId = query.get("variantId");
    const productHandle = query.get("handle");
    const quantity = query.get("quantity");

    if (!isDirectBuy || !variantId || !quantity || !productHandle) return false;

    const previousSession = sessionStorage.getItem("direct_buy");
    if (previousSession === variantId) return false;

    sessionStorage.setItem("direct_buy", variantId);
    return true;
  }

  showPopup() {
    this.style.display = "block";
    this.getBuyNowButton();
  }

  hidePopup() {
    this.formWrapper.innerHTML = "";
    this.style.display = "none";
  }
}

customElements.define("direct-buy", DirectBuy);