import { NavigationArrows, Presentation, throttle } from 'kedan';

class Swiper extends Presentation {
  constructor({
    // Presentation
    items = [],
    loop = false,
    debug = false,
    startAt = 0,
    onBegin,
    onChange,
    onComplete,
    initCallback,

    // Swiper
    enabled = true,
    horizontal = true,
    arrows = true,

    // Swiper events
    dispatcher = window,
    keyboard = true,
    wheel = true,
    wheelThrottleDelay = 250,
    cancelSwipeDelay = 1000,
    minSwipeMovement = 0.0618, // 0-1 proportion of window
  } = {}) {
    super({
      items,
      loop,
      debug,
      startAt,
      onBegin,
      onChange,
      onComplete,
      initCallback,
    });

    Object.assign(this, {
      enabled,
      horizontal,
      dispatcher,
      keyboard,
      wheel,
      wheelThrottleDelay,
      cancelSwipeDelay,
      minSwipeMovement,
    });

    if (arrows) {
      this.arrows = new NavigationArrows(arrows);
      this.arrows.horizontal = horizontal;
      this.refreshArrows();
    }

    this.bind();
  }

  /*-------------------------------------------------------------------------/

		Override

	/-------------------------------------------------------------------------*/

  goto(index, trigger = true) {
    const indexDecreasing = index < this.index;

    if (this.loop) {
      const loopingForward = this.isEnding && index === 0;
      const loopingBackwards = this.isStarting && index === this.lastIndex;
      this._backwards =
        (indexDecreasing && !loopingForward) || loopingBackwards;
    } else {
      this._backwards = indexDecreasing;
    }

    super.goto(index, trigger);

    this.refreshArrows();
  }

  refreshArrows() {
    this.arrows?.disable(
      this.isStarting && !this.loop,
      this.isEnding && !this.loop
    );
  }

  /*-------------------------------------------------------------------------/

		Events

	/-------------------------------------------------------------------------*/

  bind() {
    if (this.keyboard) this.bindKeyboard();
    if (this.wheel) this.bindWheel();
    if (this.dispatcher) this.bindSwipe();
    this.arrows?.bind(
      () => this.back(),
      () => this.forward()
    );
  }

  bindKeyboard() {
    const matchKeys = (event, keys) => keys.includes(event.key);

    this.onKeyDown = function (event) {
      if (!this.enabled) return;
      if (matchKeys(event, this.activeKeys)) event.preventDefault();
    }.bind(this);

    this.onKeyUp = function (event) {
      if (!this.enabled) return;
      if (matchKeys(event, this.activeKeys)) event.preventDefault();
      else return;

      if (matchKeys(event, this.backKeys)) return this.back();
      if (matchKeys(event, this.forwardKeys)) return this.forward();
    }.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  bindWheel() {
    this.onWheel = throttle(
      function (event) {
        if (!this.enabled) return;

        const backwards = event.deltaX ? event.deltaX < 0 : event.deltaY < 0;

        if (backwards) this.back();
        else this.forward();
      }.bind(this),
      this.wheelThrottleDelay
    );

    this.dispatcher.addEventListener('wheel', this.onWheel);
  }

  bindSwipe() {
    this.onMouseDown = function (event) {
      if (!this.enabled || event.button > 0) return;

      this.start = { x: event.clientX, y: event.clientY };
      this.swiping = true;

      const cancelSwipe = function () {
        this.swiping = false;
      }.bind(this);
      this.cancelSwipeTimer = setTimeout(cancelSwipe, this.cancelSwipeDelay);
    }.bind(this);

    this.onMouseUp = function (event) {
      clearTimeout(this.cancelSwipeTimer);

      if (!this.swiping) return;
      this.swiping = false;

      const movement = this.horizontal
        ? (event.clientX - this.start.x) / window.innerWidth
        : (event.clientY - this.start.y) / window.innerHeight;
      if (Math.abs(movement) < this.minSwipeMovement) return;

      if (movement > 0) this.back();
      else this.forward();
    }.bind(this);

    this.onTouchStart = function (event) {
      this.onMouseDown(event.targetTouches[0]);
    }.bind(this);

    this.onTouchEnd = function (event) {
      this.onMouseUp(event.changedTouches[0]);
    }.bind(this);

    this.dispatcher.addEventListener('mousedown', this.onMouseDown);
    this.dispatcher.addEventListener('mouseup', this.onMouseUp);
    this.dispatcher.addEventListener('touchstart', this.onTouchStart);
    this.dispatcher.addEventListener('touchend', this.onTouchEnd);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.onKeyDown = null;
    this.onKeyUp = null;

    this.dispatcher.addEventListener('wheel', this.onWheel);
    this.onWheel = null;

    this.dispatcher.removeEventListener('mousedown', this.onMouseDown);
    this.dispatcher.removeEventListener('mouseup', this.onMouseUp);
    this.dispatcher.removeEventListener('touchstart', this.onTouchStart);
    this.dispatcher.removeEventListener('touchend', this.onTouchEnd);
    this.onMouseDown = null;
    this.onMouseUp = null;
    this.onTouchStart = null;
    this.onTouchEnd = null;

    this.arrows.dispose();
  }

  /*-------------------------------------------------------------------------/

		Getters & Setters

	/-------------------------------------------------------------------------*/

  get backwards() {
    return this._backwards;
  }

  set backwards(boolean) {
    this._backwards = boolean;
  }

  /*-------------------------------------------------------------------------/

		Read-only

	/-------------------------------------------------------------------------*/

  get backKeys() {
    return this.horizontal ? ['ArrowLeft'] : ['ArrowUp'];
  }

  get forwardKeys() {
    return this.horizontal ? ['ArrowRight'] : ['ArrowDown'];
  }

  get activeKeys() {
    return [...this.backKeys, ...this.forwardKeys];
  }
}

export { Swiper };
