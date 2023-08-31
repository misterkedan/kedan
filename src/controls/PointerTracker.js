const clamp = (n) => Math.max(0, Math.min(1, n));
const normalize = (n, max) => clamp(n / max); // 0 > 1
const flip = (n) => 1 - n; // 1 > 0
const sign = (n) => n * 2 - 1; // -1 > 1
const signFlip = (n) => 1 - n * 2; // 1 > -1
const toMiddle = (n) => 1 - Math.abs(n - 0.5) * 2; // 0 > 1 > 0
const toEdges = (n) => Math.abs(n - 0.5) * 2; // 1 > 0 > 1

class PointerTracker {
  constructor({
    width = window.innerWidth,
    height = window.innerHeight,
    margin = 0, // 0-1 portion of total size
    dispatcher = window,
    enabled = true,
    debug = false,
    onChange,
  } = {}) {
    // Compute layout

    const defaultMargin = margin > 0 ? margin : 0;
    this.margin = {
      top: margin.top || defaultMargin,
      left: margin.left || defaultMargin,
      bottom: margin.bottom || defaultMargin,
      right: margin.right || defaultMargin,
    };

    this.hitbox = {
      width,
      height,
      top: this.margin.top,
      left: this.margin.left,
    };

    this.resize(width, height);

    // Set x, y to center of screen

    const middle = 0.5;
    this.x = middle;
    this.y = middle;

    // Events

    this.enabled = enabled;
    this.dispatcher = dispatcher;

    this.onChange = onChange;
    if (debug) this.onDebug = this.log;

    this.bind();
  }

  bind() {
    this.onMouseMove = function (event) {
      this.track(event.clientX, event.clientY);
    }.bind(this);

    this.onTouchMove = function (event) {
      this.onMouseMove(event.targetTouches[0]);
    }.bind(this);

    this.dispatcher.addEventListener('touchmove', this.onTouchMove);
    this.dispatcher.addEventListener('mousemove', this.onMouseMove);
  }

  dispose() {
    this.dispatcher.removeEventListener('touchmove', this.onTouchMove);
    this.dispatcher.removeEventListener('mousemove', this.onMouseMove);
    this.onMouseMove = null;
    this.onTouchMove = null;
  }

  track(clientX, clientY) {
    if (!this.enabled) return;

    let trigger;

    if (this.clientX !== clientX) {
      this.clientX = clientX;
      const x = normalize(clientX - this.hitbox.left, this.hitbox.width);
      if (this.x !== x) {
        this.x = x;
        trigger = true;
      }
    }

    if (this.clientY !== clientY) {
      this.clientY = clientY;
      const y = normalize(clientY - this.hitbox.top, this.hitbox.height);
      if (this.y !== y) {
        this.y = y;
        trigger = true;
      }
    }

    if (trigger) {
      this.onChange?.();
      this.onDebug?.();
    }
  }

  resize(width, height) {
    const left = this.margin.left * width;
    const right = this.margin.right * width;
    this.hitbox.width = width - left - right;
    this.hitbox.left = left;

    const top = this.margin.top * height;
    const bottom = this.margin.bottom * height;
    this.hitbox.height = height - top - bottom;
    this.hitbox.top = top;
  }

  log() {
    const { x, y } = this;
    console.log({ x, y });
  }

  /*-------------------------------------------------------------------------/

		Read-only

	/-------------------------------------------------------------------------*/

  get xFlip() {
    return flip(this.x);
  }

  get yFlip() {
    return flip(this.y);
  }

  get xSign() {
    return sign(this.x);
  }

  get ySign() {
    return sign(this.y);
  }

  get xSignFlip() {
    return signFlip(this.x);
  }

  get ySignFlip() {
    return signFlip(this.y);
  }

  get xMid() {
    return toMiddle(this.x);
  }

  get yMid() {
    return toMiddle(this.y);
  }

  get xEdge() {
    return toEdges(this.x);
  }

  get yEdge() {
    return toEdges(this.y);
  }
}

export { PointerTracker };
