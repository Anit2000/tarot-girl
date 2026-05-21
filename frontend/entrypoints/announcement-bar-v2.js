class AnnouncementBar extends HTMLElement {
    constructor() {

        super();

        this.container = this.querySelector(
            '[data-role="container"]'
        );

        this.blocks = Array.from(
            this.querySelectorAll(
                '[data-role="announcement-strip"]'
            )
        );

        this.autoplay =
            this.dataset.autoplay === 'true';

        this.interval = null;

        this.autoplayTime =
            Number(this.dataset.time) * 1000 || 3000;

        this.copyBlocks = this.blocks.filter(
            (el) => el.dataset.behavior === 'copy'
        );

        this.redirectionBlocks = this.blocks.filter(
            (el) => el.dataset.behavior === 'redirect'
        );

        this.nextArrow = this.querySelector(
            '[data-role="next"]'
        );

        this.prevArrow = this.querySelector(
            '[data-role="prev"]'
        );

        this.closeButton = this.querySelector(
            '[data-role="close"]'
        );

        this.initializeEvents();

    }

    connectedCallback() {

        this.handleInitialState();

        if (window.KeenSlider) {

            this.blocks.length > 1 ?
                this.initializeSlider() :
                this.showSlider();

            this.blocks.length > 1 ?
                this.enableAutoplay() :
                '';

        } else {

            window.addEventListener(
                'custom:KeenLoaded',
                () => {

                    this.blocks.length > 1 ?
                        this.initializeSlider() :
                        this.showSlider();

                    this.blocks.length > 1 ?
                        this.enableAutoplay() :
                        '';

                }
            );

        }

    }

    initializeEvents() {

        if (this.nextArrow) {

            this.nextArrow.addEventListener(
                'click',
                () => {

                    this.slider.next();

                    this.sliderAutoplay(false);

                }
            );

        }

        if (this.prevArrow) {

            this.prevArrow.addEventListener(
                'click',
                () => {

                    this.slider.prev();

                    this.sliderAutoplay(false);

                }
            );

        }

        if (this.closeButton) {

            console.log("hello")
            this.closeButton.addEventListener(
                'click',
                this.closeAnnouncement.bind(this)
            );

        }

        this.copyBlocks.forEach((el) => {

            el.addEventListener(
                'click',
                () => {

                    const text = el.dataset.content;

                    this.copyCoupon(text);

                    this.copyAnimation(el);

                }
            );

        });

        this.blocks.forEach((el) => {

            el.addEventListener(
                'click',
                () => {

                    this.dataLayerPushOnClick(el);

                }
            );

        });

    }

    handleInitialState() {

        const hiddenState = localStorage.getItem(
            'swAnnouncementHidden'
        );

        if (hiddenState === 'true') {

            this.style.display = 'none';

        }

    }

    closeAnnouncement() {

        this.style.display = 'none';

        localStorage.setItem(
            'swAnnouncementHidden',
            'true'
        );

    }

    copyAnimation(el) {

        el.classList.add('copied');

        const copiedText =
            el.querySelector('[data-role="copied-text"]');

        if (copiedText) {

            copiedText.classList.remove('sw-hidden');

        }

        setTimeout(() => {

            el.classList.remove('copied');

            if (copiedText) {

                copiedText.classList.add('sw-hidden');

            }

        }, 3000);

    }

    copyCoupon(text) {

        if (!text) return;

        navigator.clipboard.writeText(text);

    }

    dataLayerPushOnClick(el) {

        if (
            typeof dataLayer !== 'undefined' &&
            window.custom_data_events
        ) {

            dataLayer.push({
                event: window.custom_data_events
                    .announcement.events.click,

                offer_text: el.dataset.text,
            });

        }

    }

    enableAutoplay() {

        if (!this.autoplay) return;

        this.sliderAutoplay(true);

        this.addEventListener(
            'mouseenter',
            () => {

                clearInterval(this.interval);

            }
        );

        this.addEventListener(
            'mouseleave',
            () => {

                this.sliderAutoplay(true);

            }
        );

    }

    sliderAutoplay(run = true) {

        clearInterval(this.interval);

        if (!run) return;

        this.interval = setInterval(() => {

            if (this.slider) {

                this.slider.next();

            }

        }, this.autoplayTime);

    }

    initializeSlider() {

        this.slider = new window.KeenSlider(
            this.container, {
                loop: true,

                drag: false,

                renderMode: 'performance',

                slides: {
                    origin: 'center',
                    perView: 1,
                },

                vertical: true,

                created: () => {

                    this.showSlider();

                },

            }
        );

    }

    showSlider() {

        this.container.style.opacity = '1';

    }

}

customElements.define(
    'announcement-bar',
    AnnouncementBar
);