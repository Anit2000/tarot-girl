class DirectBuy extends HTMLElement {
  constructor() {
    super();
    this.formWrapper = this.querySelector('[data-role="form-wrapper"]');
  }

  connectedCallback() {
    if (this.checkIfADirectBuy()) this.showPopup.call(this);
  }

  async getBuyNowButton() {
  try {
    const query = new URLSearchParams(window.location.search);
    const variantIdsString = query.get("variants");

    if (!variantIdsString) throw new Error("No variants in URL");

    const variants = variantIdsString.split(",").map((el) => {
      const [id, quantity] = el.split(":");
      return { id, quantity: Number(quantity) };
    });

    const cartClear = await fetch("/cart/clear.js", { method: "POST" });
    if (!cartClear.ok) throw new Error("Failed to clear cart");

    const cartAdd = await fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: variants, sections: "mini-cart-v2" }),
    });
    if (!cartAdd.ok) throw new Error("Failed to add to cart");

    const cartAddRes = await cartAdd.json();
    const miniCartHtml = cartAddRes.sections["mini-cart-v2"];
    this.formWrapper.innerHTML = miniCartHtml;

    const checkoutBtn = this.formWrapper?.querySelector('a[href="/checkout"]');
    if (!checkoutBtn) throw new Error("No checkout btn found");

    await this.waitForRazorpay();
    checkoutBtn.click();
    this.hidePopup.call(this)
  } catch (err) {
    console.warn("Failed to get buy now button reason --> " + err.message);
    this.hidePopup.call(this)
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
  checkIfADirectBuy() {
    const query = new URLSearchParams(window.location.search);
    const isDirectBuy = query.get("direct_buy");
    if (!isDirectBuy) return false;

    const previousSession = sessionStorage.getItem("direct_buy");
    if (previousSession) return false;

    sessionStorage.setItem("direct_buy", "true");
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