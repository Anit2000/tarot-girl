class SaleCounter extends HTMLElement {
  constructor() {
    super();

    this.saleConfig = JSON.parse(
      this.querySelector('script[type="applicationId/json"]')?.innerHTML
    );
    this.dayBlock = this.querySelector('[data-role="days"]');
    this.hourBlock = this.querySelector('[data-role="hours"]');
    this.minuteBlock = this.querySelector('[data-role="minutes"]');
    this.secondBlock = this.querySelector('[data-role="seconds"]');

    this.startDate = new Date(this.saleConfig.config.start_date);

    this.saleConfig.config.behavior == "loop"
      ? this.initializeLoopTimer.call(this)
      : "";
  }
  initializeLoopTimer() {
    let startDate = this.startDate;
    const loopingHours = Number(this.saleConfig.config.looping_hours);
    let endDate = new Date(
      this.startDate.getTime() + loopingHours * 60 * 60 * 1000
    );
    let currentDate = new Date();
    if (currentDate.getTime() > endDate.getTime()) {
      let difference = currentDate.getTime() - endDate.getTime();
      let daysGap = Math.ceil(difference / (1000 * 3600 * 24));
      startDate = new Date(startDate.getTime() + daysGap * 24 * 60 * 60 * 1000);
      endDate = new Date(startDate.getTime() + loopingHours * 60 * 60 * 1000);
    }
    setInterval(() => {
      let currentDate = new Date();
      let diffInMs = endDate.getTime() - currentDate.getTime();
      let daysLeft = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      let hoursLeft = Math.floor(
        (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      let minutesLeft = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      let secondsLeft = Math.floor((diffInMs % (1000 * 60)) / 1000);

      if (this.dayBlock) {
        let daysPercentInNum =
          daysLeft /
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
          );
        let daysPercentage =
          daysPercentInNum == 0 ? 0 : 100 - daysPercentInNum * 100;

        this.updateDays.call(
          this,
          daysLeft.toString().padStart(2, "0"),
          daysPercentage
        );
      }
      if (this.hourBlock) {
        let hoursPercentage = 100 - ((24 - hoursLeft) / 24) * 100;
        this.updateHours.call(
          this,
          hoursLeft.toString().padStart(2, "0"),
          hoursPercentage
        );
      }
      if (this.minuteBlock) {
        let minutesPercentage = 100 - ((60 - minutesLeft) / 60) * 100;
        this.updateMinutes.call(
          this,
          minutesLeft.toString().padStart(2, "0"),
          minutesPercentage
        );
      }
      if (this.secondBlock) {
        let secondsPercentage = 100 - ((60 - secondsLeft) / 60) * 100;
        this.updateSeconds.call(
          this,
          secondsLeft.toString().padStart(2, "0"),
          secondsPercentage
        );
      }
    }, 1000);
  }
  updateDays(time, percentage) {
    this.dayBlock.querySelector('[data-role="day-text"]').innerHTML = time;
    let circle = this.secondBlock?.querySelector(
      '[data-role="progress-bar"] circle'
    );
    window.innerWidth < 768
      ? circle?.setAttribute("r", "47%")
      : circle?.setAttribute("r", "48%");
    let circleRadius =
      this.secondBlock?.querySelector('[data-role="progress-bar"]')
        ?.clientHeight / 2;
    let circumfrence = 2 * (22 / 7) * circleRadius;
    let progress = circumfrence - (percentage / 100) * circumfrence;
    this.dayBlock
      .querySelector('[data-role="progress-bar"]')
      .setAttribute("style", `--progress-day:${progress}px`);
  }
  updateHours(time, percentage) {
    this.hourBlock.querySelector('[data-role="hours-text"]').innerHTML = time;
    let circle = this.hourBlock?.querySelector(
      '[data-role="progress-bar"] circle'
    );
    window.innerWidth < 768
      ? circle?.setAttribute("r", "47%")
      : circle?.setAttribute("r", "48%");
    let circleRadius =
      this.secondBlock?.querySelector('[data-role="progress-bar"]')
        ?.clientHeight / 2;
    let circumfrence = 2 * (22 / 7) * circleRadius;
    let progress = circumfrence - (percentage / 100) * circumfrence;
    this.hourBlock
      .querySelector('[data-role="progress-bar"]')
      .setAttribute("style", `--progress-hour:${progress}px`);
  }
  updateMinutes(time, percentage) {
    this.minuteBlock.querySelector('[data-role="minutes-text"]').innerHTML =
      time;
    let circle = this.minuteBlock?.querySelector(
      '[data-role="progress-bar"] circle'
    );
    window.innerWidth < 768
      ? circle?.setAttribute("r", "47%")
      : circle?.setAttribute("r", "48%");
    let circleRadius =
      this.secondBlock?.querySelector('[data-role="progress-bar"]')
        ?.clientHeight / 2;
    let circumfrence = 2 * (22 / 7) * circleRadius;
    let progress = circumfrence - (percentage / 100) * circumfrence;
    this.minuteBlock
      .querySelector('[data-role="progress-bar"]')
      .setAttribute("style", `--progress-minute:${progress}px`);
  }
  updateSeconds(time, percentage) {
    this.secondBlock.querySelector('[data-role="seconds-text"]').innerHTML =
      time;
    let circle = this.secondBlock?.querySelector(
      '[data-role="progress-bar"] circle'
    );
    window.innerWidth < 768
      ? circle?.setAttribute("r", "47%")
      : circle?.setAttribute("r", "48%");
    let circleRadius =
      this.secondBlock?.querySelector('[data-role="progress-bar"]')
        ?.clientHeight / 2;
    let circumfrence = 2 * (22 / 7) * circleRadius;
    let progress = circumfrence - (percentage / 100) * circumfrence;
    console.log(progress, percentage, circumfrence);
    this.secondBlock
      .querySelector('[data-role="progress-bar"]')
      .setAttribute("style", `--progress-second:${progress}px`);
  }
  connectedCallback() {}
}
customElements.define("sale-counter", SaleCounter);