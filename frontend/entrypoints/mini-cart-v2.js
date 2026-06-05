class MiniCart extends HTMLElement {
    constructor() {
        super();
        this.displayAnimation = null;

        this.wrapper = this.querySelector('[data-role="wrapper"]');
        this.cartCloseBtn = this.querySelector('[data-role="cart-close"]');

        document.addEventListener("custom:CartUpdate", this.updateCart.bind(this));
        document.addEventListener(
            "custom:CartInternalUpdate",
            this.hydrateInternalCart.bind(this),
        );

        window.cartId = this.dataset.id;

        document.addEventListener(
            "custom:MiniCartShow",
            this.showMiniCart.bind(this),
        );
        this.addEventListener("click", (e) => {
            if (
                e.target.dataset.role == "cart-close" ||
                e.target.closest('[data-role="cart-close"]')
            ) {
                this.hideMiniCart.call(this);
            }
        });
    }
    updateCartCountEverywhere(count) {
        let cartCountContainers = Array.from(
            document.querySelectorAll('[data-role="cart-count"]'),
        );
        cartCountContainers.forEach((el) => {
            count > 0 ? el.classList.add("active") : el.classList.remove("active");
            el.innerHTML = count;
        });
    }
    showMiniCart() {
        if (this.displayAnimation) {
            this.displayAnimation.cancel();
        }
        this.style.display = "block";
        this.classList.add("animating");
        this.displayAnimation = this.wrapper.animate(
            [{ maxWidth: 0 }, { maxWidth: window.innerWidth <= 768 ? "100%" : '400px' }],
            { duration: 300, easing: "ease-out" },
        );
        this.displayAnimation.onfinish = () => this.classList.remove("animating");
    }
    hideMiniCart() {
        if (this.displayAnimation) {
            this.displayAnimation.cancel();
        }
        this.displayAnimation = this.wrapper.animate(
            [{ maxWidth: window.innerWidth <= 768 ? "100%" : '400px'  }, { maxWidth: "0%" }],
            { duration: 300, easing: "ease-out" },
        );
        this.displayAnimation.onfinish = () => {
            this.classList.remove("animating");
            this.style.display = "none";
        };
    }
    updateCart(e) {
        try {
            let cartHtmlDetails = e.detail?.sections?.["mini-cart-v2"];
            if (!cartHtmlDetails) {
                throw new Error("cart details not provided");
            }
            const htmlParser = new DOMParser();
            const cartHtml = htmlParser.parseFromString(cartHtmlDetails, "text/html");
            const cartData = JSON.parse(
                cartHtml.querySelector('script[data-id="cart"]').innerHTML,
            );
            const cartWrapperContent = cartHtml.querySelector(
                '[data-role="wrapper"]',
            );
            this.wrapper.innerHTML = cartWrapperContent.innerHTML;
            cartData.item_count <= 0
                ? this.classList.add("empty")
                : this.classList.remove("empty");
            this.updateCartCountEverywhere.call(this, cartData.item_count);
        } catch (err) {
            console.warn("Failed to update cart reason -->" + err.message);
        }
    }
    hydrateInternalCart(e) {
        try {
            let data = e.detail;
            const cartHtmlData = e.detail.sections[window.cartId];
            const parser = new DOMParser();
            const parsedCartHtml = parser.parseFromString(cartHtmlData, "text/html");
            const miniCartHtml = parsedCartHtml.querySelector("mini-cart");
            const summaryHtml = miniCartHtml?.querySelector('[data-role="summary"]');
            const discountHtml = miniCartHtml?.querySelector('discount-form');
            if (data.item_count <= 0) {
                this.classList.add("empty");
            } else {
                this.classList.remove("empty");
            }
            this.querySelector('[data-role="summary"]').innerHTML =
                summaryHtml.innerHTML;
            this.querySelector('discount-form').innerHTML = discountHtml.innerHTML;
            this.updateCartCountEverywhere.call(this, data.item_count);
        } catch (err) {
            console.warn("Failed to hydrate internal cart");
        }
    }
}

customElements.define("mini-cart", MiniCart);

class CartItem extends HTMLElement {
    constructor() {
        super();

        this.removeBtn = this.querySelector('[data-role="item-remove"]');
        this.key = this.dataset.key;
        this.quantityInput = this.querySelector('input[name="quantity"]');

        this.addEventListener("change", this.updateQuantity.bind(this));

        this.removeBtn?.addEventListener(
            "click",
            this.removeItemFromCart.bind(this),
        );
    }
    async updateQuantity() {
        try {
            this.classList.add("loading");
            let currentQuantity = this.quantityInput.value;
            let payload = {
                line: this.key,
                quantity: currentQuantity,
                sections: window.cartId,
            };
            const request = await fetch(
                window.Shopify.routes.root + "cart/change.js",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );
            if (request.status != 200) {
                throw new Error("Failed to update quantity");
            }
            const res = await request.json();
            document.dispatchEvent(
                new CustomEvent("custom:CartInternalUpdate", {
                    detail: res,
                }),
            );
        } catch (err) {
            console.warn("Failed to update quantity reason -->" + err.message);
        } finally {
            this.classList.remove("loading");
        }
    }
    async removeItemFromCart() {
        try {
            this.classList.add("loading");
            const request = await fetch(
                window.Shopify.routes.root + "cart/change.js",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        line: this.key,
                        quantity: 0,
                        sections: window.cartId,
                    }),
                },
            );
            if (request.status != 200) {
                throw new Error("Failed to remove item from cart");
            }
            const res = await request.json();
            document.dispatchEvent(
                new CustomEvent("custom:CartInternalUpdate", {
                    detail: res,
                }),
            );
            if (this.displayAnimation) {
                this.displayAnimation.cancel();
            }
            this.displayAnimation = this.animate(
                [{ maxHeight: "100%" }, { maxHeight: "0px" }],
                {
                    duration: 300,
                    easing: "ease-out",
                },
            );
            this.displayAnimation.onfinish = () => (this.style.display = "none");
        } catch (err) {
            console.warn("Failed to remove item reason -->" + err.message);
        } finally {
            this.classList.remove("loading");
        }
    }
}

customElements.define("cart-item", CartItem);

class AtcPopup extends HTMLElement {
    constructor() {
        super();
        this.wrapper = this.querySelector('[data-role="wrapper"]');
        this.displayAnimation = null;
        this.hideAnimation = null;
        this.currentTimeout = null;

        document.addEventListener(
            "custom:showAtcPopup",
            this.showAtcPopup.bind(this),
        );
    }
    showAtcPopup(e) {
        console.log(e);
        let isSuccess = e.detail.success ? true : false;
        let isFailed = e.detail.failed ? true : false;
        if (!isSuccess && !isFailed) {
            return;
        }
        if (isSuccess) {
            this.classList.add("success");
            this.classList.remove("failed");
        } else {
            this.classList.add("failed");
            this.classList.remove("success");
        }
        this.playAnimation.call(this);
    }

    playAnimation() {
        this.style.display = "block";
        if (this.displayAnimation) {
            this.displayAnimation.cancel();
        }
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
        }
        this.displayAnimation = this.wrapper?.animate(
            [
                { top: "100px", opacity: "0" },
                { top: "160px", opacity: "100" },
            ],
            {
                duration: 300,
                easing: "ease-out",
            },
        );

        this.displayAnimation.onfinish = () => {
            this.currentTimeout = setTimeout(() => {
                if (this.hideAnimation) {
                    this.hideAnimation.cancel();
                }
                this.hideAnimation = this.wrapper?.animate(
                    [
                        { top: "160px", opacity: "100" },
                        { top: "100px", opacity: "0" },
                    ],
                    {
                        duration: 300,
                        easing: "ease-out",
                    },
                );
                this.hideAnimation.onfinish = () => (this.style.display = "none");
            }, 1500);
        };
    }
}

customElements.define("atc-popup", AtcPopup);

class DiscountForm extends HTMLElement {
    constructor() {
        super();
        this.form = this.querySelector("form");
        this.submissionButton = this.form.querySelector('button');


        this.form.addEventListener("submit", this.handleFormSubmission.bind(this));
        this.submissionButton?.addEventListener('click', this.handleFormSubmission.bind(this));
        this.input = this.querySelector('input[name="discount"]');

        this.addEventListener("click", async (e) => {
            if (
                e.target.dataset.role == "discount-btn" ||
                e.target.closest('[data-role="discount-btn"]')
            ) {
                e.preventDefault();
                this.removeDiscount.call(this);
            }
        });
    }
    async removeDiscount() {
        try {
            this.classList.add('applying');
            const request = await fetch(
                window.Shopify.routes.root + "cart/update.js",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        discount: "",
                        sections: window.cartId,
                    }),
                },
            );
            if (request.status != 200) {
                throw new Error("Failed to remove discount");
            }
            const res = await request.json();
            document.dispatchEvent(
                new CustomEvent("custom:CartInternalUpdate", {
                    detail: res,
                }),
            );
        } catch (err) {
            console.warn("Failed to remove discount reaosn -->" + err.message);
        } finally {
            this.classList.remove('applying');
        }
    }
    async handleFormSubmission(e) {
        e.preventDefault();
        e.stopPropagation();
        try {
            this.classList.add("applying");
            let discountCode = this.input.value;
            if (discountCode.trim().length == 0) {
                return;
            }
            const request = await fetch(
                window.Shopify.routes.root + "cart/update.js",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        discount: discountCode,
                        sections: window.cartId,
                    }),
                },
            );
            if (request.status != 200) {
                throw new Error("Failed to apply discount");
            }
            const res = await request.json();
            if (!res.discount_codes[0].applicable) {
                throw new Error("Coupon not applicable");
            } else {
            }
            document.dispatchEvent(
                new CustomEvent("custom:CartInternalUpdate", {
                    detail: res,
                }),
            );
        } catch (err) {
            console.warn("Failed to apply discount reason -->" + err.message);
        } finally {
            this.classList.remove("applying");
        }
    }
}

customElements.define("discount-form", DiscountForm);
