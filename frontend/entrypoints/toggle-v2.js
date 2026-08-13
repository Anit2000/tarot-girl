class DetailsToggle extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector('[data-role="content"]');
    this.toggleBtn = this.querySelector('[data-role="toggle-btn"]');
    this.animation = null;

    this.toggleBtn?.addEventListener("click", () => {
      const display = getComputedStyle(this.content).display;
      display == "none" ? this.show.call(this) : this.hide.call(this);
    });
  }

  show() {
    if (this.animation) {
      this.animation.cancel();
    }
    this.classList.add("active");
    const startHeight = "0px";
    const endHeight = `1000px`;
    this.content.style.display = "block";
    this.content.style.overflow = "hidden";
    this.content.style.maxHeight = "1000px";
    this.animation = this.content?.animate(
      {
        maxHeight: [startHeight, endHeight],
        opacity: [0, 1],
      },
      {
        duration: 400,
        easing: "ease-out",
      }
    );
  }
  hide() {
    if (this.animation) {
      this.animation.cancel();
    }
    this.classList.remove("active");

    const startHeight = `1000px`;
    const endHeight = "0px";

    this.animation = this.content?.animate(
      {
        maxHeight: [startHeight, endHeight],
        opacity: [1, 0],
      },
      {
        duration: 400,
        easing: "ease-out",
      }
    );
    this.animation.onfinish = () =>
      (this.content.style.display = this.content.style.maxHeight = "");
  }
}
customElements.define("toggle-details", DetailsToggle);
