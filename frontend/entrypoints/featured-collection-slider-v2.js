class FeaturedSlider extends HTMLElement {
    constructor() {
      super();
      this.sliderWrapper = this.querySelector('[data-role="slider-wrapper"]');
      this.thumbWrapper = this.querySelector('[dat-role="thumb-wrapper"]');
      this.sliderThumb = this.querySelector('[data-role="thumb"]');
    }
    connectedCallback() {
      if (window.KeenSlider) {
        this.initializeSlider.call(this, window.KeenSlider);
      } else {
        document.addEventListener(
          "custom:KeenLoaded",
          this.initializeSlider.bind(this, window.KeenSlider)
        );
      }
    }
    initializeSlider(Slider) {
      this.slider = new Slider(
        this.sliderWrapper,
        {
          loop: false,
          rubberband: false,
          mode: "free",
          slides: {
            perView: 2.12,
            spacing: 8,
          },
          breakpoints: {
            "(min-width: 768px)": {
              slides: {
                perView: 4,
                spacing: 16,
              },
            },
             "(min-width: 1200px)": {
              slides: {
                perView: 6,
                spacing: 16,
              },
            },
          },
        },
        [
          (slider) => {
            slider.on("created", () => {
              console.log("slider was created and attaching the thumb here");
              this.wheelControls(slider);
              this.syncThumbSlider.call(this, slider);
            });
          },
          this.wheelControls,
        ]
      );
    }
    wheelControls(slider) {
      var touchTimeout;
      var position;
      var wheelActive;
  
      function dispatch(e, name) {
        position.x -= e.deltaX;
        position.y -= e.deltaY;
        slider.container.dispatchEvent(
          new CustomEvent(name, {
            detail: {
              x: position.x,
              y: position.y,
            },
          })
        );
      }
  
      function wheelStart(e) {
        position = {
          x: e.pageX,
          y: e.pageY,
        };
        dispatch(e, "ksDragStart");
      }
  
      function wheel(e) {
        dispatch(e, "ksDrag");
      }
  
      function wheelEnd(e) {
        dispatch(e, "ksDragEnd");
      }
  
      function eventWheel(e) {
        if(Math.abs(e.deltaY) > 5){
          return;
        }
        e.preventDefault();
        if (!wheelActive) {
          wheelStart(e);
          wheelActive = true;
        }
        wheel(e);
        clearTimeout(touchTimeout);
        touchTimeout = setTimeout(() => {
          wheelActive = false;
          wheelEnd(e);
        }, 50);
      }
  
      slider.on("created", () => {
        slider.container.addEventListener("wheel", eventWheel, {
          passive: false,
        });
      });
    }
    syncThumbSlider(slider) {
      console.log("Sync slider was called here", slider);
      if (!this.thumbWrapper) return;
      this.sliderObserver.call(this);
    }
    sliderObserver() {
      const observer = new MutationObserver(() => {
        const translateVal = getComputedStyle(
          this.querySelector(".keen-slider__slide")
        ).transform;
        const numSlides = this.slider.slides.length;
        const wrapperWidth = this.sliderWrapper.offsetWidth;
        const perSliderWidth = wrapperWidth / numSlides;
        this.sliderThumb.style.width = `${perSliderWidth}px`;
        const currentProgress = this.slider.track.details.progress;
        const calcTranslate =
          currentProgress * 100 > 100 ? 100 : currentProgress * 100;
        const minusVal = calcTranslate > 0 ? perSliderWidth : 0;
        this.sliderThumb.style.left = `calc(${calcTranslate}%)`;
        this.sliderThumb.style.transform = `translateX(-${calcTranslate}%)`;
      });
      observer.observe(this.querySelector(".keen-slider__slide"), {
        attributes: true,
      });
    }
  }
  customElements.define("featured-slider", FeaturedSlider);