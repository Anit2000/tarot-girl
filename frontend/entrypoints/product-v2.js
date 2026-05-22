class ProductGallery extends HTMLElement {
  constructor() {
    super();
    this.sliderWrapper = this.querySelector('[data-role="slider"]');
    this.slides = Array.from(
      this.querySelectorAll('[data-role="slider_slider"]'),
    );
    this.Keenslider = window.KeenSlider || null;

    if (this.sliderWrapper) {
      this.Keenslider ? this.initializeSlider.call(this) : "";
    }

    document.addEventListener("custom:KeenLoaded", () => {
      this.Keenslider = window.KeenSlider;
      this.initializeSlider.call(this);
    });
  }

  initializeSlider() {
    this.sliderFn = new this.Keenslider(this.sliderWrapper, {
      loop: true,
      selector: this.slides,
    });
  }
}
customElements.define("product-gallery", ProductGallery);

class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector("form");
    this.optionsList = Array.from(this.querySelectorAll('input[type="radio"]'));
    this.productData = JSON.parse(
      this.querySelector(
        'script[type="applicationId/json"][data-role="product-data"]',
      )?.innerHTML || "{}",
    );
    this.productMetaData = JSON.parse(
      this.querySelector(
        'script[type="applicationId/json"][data-role="product-metadata"]',
      )?.innerHTML || "{}",
    );
    this.priceField = this.querySelector('[data-role="variant-price"]');
    this.variantTitle = this.querySelector('[data-role="variant-title"]');
    this.variantDescriptionField = this.querySelector(
      '[data-role="variant-short"]',
    );
    this.variantPrice = this.querySelector('[data-role="variant-price"]');

    console.log(this.productData, this.productMetaData);

    this.form?.addEventListener("submit", this.handleFormSubmission.bind(this));

    this.form?.addEventListener(
      "change",
      this.handleOptionSelectionChange.bind(this),
    );
  }
  handleFormSubmission(e) {
    e.preventDefault();
    try{
      let currentlySelectedValues = this.optionsList
        .filter((el) => el.checked)
        .map((el) => el.value);
      let correpondingVariant = this.productData.variants.find(
        (el) =>
          el.options.length == currentlySelectedValues.length &&
          el.options.every(
            (opt) => currentlySelectedValues.indexOf(opt.toLowerCase()) != -1,
          ),
      );
      let quantity = this.querySelector('input[name="quantity"]').value || 1;
      const payload = {
        id: correpondingVariant.id,
        quantity: Number(quantity)
      };
      window.location = `/cart/${payload.id}:${payload.quantity}`;
    }catch(err){
      console.log("Failed to add items to cart reason -->" + err.message);
    }
  }
  handleOptionSelectionChange() {
    let currentlySelectedValues = this.optionsList
      .filter((el) => el.checked)
      .map((el) => el.value);
    console.log(currentlySelectedValues);
    let correpondingVariant = this.productData.variants.find(
      (el) =>
        el.options.length == currentlySelectedValues.length &&
        el.options.every(
          (opt) => currentlySelectedValues.indexOf(opt.toLowerCase()) != -1,
        ),
    );
    let correspondingVariantMetaData = this.productMetaData.variants.find(
      (el) => el.id == correpondingVariant.id,
    );
    !correpondingVariant.available
      ? this.classList.remove("available")
      : this.classList.add("available");
    console.log(correpondingVariant);
    if (
      correspondingVariantMetaData &&
      correspondingVariantMetaData?.short_description.trim().length > 0
    ) {
      this.variantDescriptionField
        ? (this.variantDescriptionField.innerHTML =
            correspondingVariantMetaData.short_description)
        : "";
      this.variantDescriptionField?.classList.add("active");
    }
    if (this.variantTitle) {
      this.variantTitle.innerHTML = correpondingVariant.title;
    }
    if (this.variantPrice) {
      this.variantPrice.innerHTML = this.moneyFormatter.call(this,correpondingVariant.price/100);
    }
  }
  moneyFormatter(amount) {
    const formatter = 
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return formatter.format(amount);
  }
}
customElements.define("product-form", ProductForm);

class QuantityInput extends HTMLElement {
  constructor() {
    super();

    this.quantityInput = this.querySelector('input[name="quantity"]');
    this.qnMinusBtn = this.querySelector('button[data-role="qn-minus"]');
    this.qnPlusBtn = this.querySelector('button[data-role="qn-plus"]');

    [this.qnMinusBtn, this.qnPlusBtn].forEach((el) =>
      el.addEventListener("click", this.handleQuantityButtons.bind(this)),
    );
  }
  handleQuantityButtons(e) {
    e.preventDefault();
    console.log(e.target);
    let typeInc =
      e.target.dataset.role == "qn-plus" ||
      e.target.closest('[data-role="qn-plus"]')
        ? true
        : false;
    let currentInputValue = Number(this.quantityInput.value);
    typeInc
      ? (this.quantityInput.value = ++currentInputValue)
      : currentInputValue > 1
      ? (this.quantityInput.value = --currentInputValue)
      : null;
  }
}
customElements.define("qn-input", QuantityInput);
