const time = Date || performance;

class Ticker {
  /**
   * Creates a ticker that will call one or several functions at either
   * a specific framerate, or on every animation frame.
   * @param { Function|Array[Function] } callbacks
   * 							Function(s) that will be repeatedly called.
   * @param { Number } fps	Frames per second limiter, 0 for uncapped frames.
   */
  constructor(callbacks = [], fps = 0, maxDelta = 1000) {
    this.callbacks = typeof callbacks === 'function' ? [callbacks] : callbacks;
    this.fps = fps;
    this.maxDelta = maxDelta;
    this.time = 0;
    this.playing = false;

    this._last = 0;
    this._frameProgress = 0;

    this.onAnimationFrame = this.onAnimationFrame.bind(this);
  }

  /*---------------------------------------------------------------------------/
    Callback management
  /---------------------------------------------------------------------------*/

  /**
   * Add a function to the animation loop.
   * @param { Function } callback  Function that will start looping.
   */
  add(callback) {
    if (this.has(callback)) return;
    this.callbacks.push(callback);
  }

  /**
   * Remove a function from the animation loop.
   * @param { Function } callback  Function that will stop looping.
   */
  remove(callback) {
    if (!this.has(callback)) return;
    this.callbacks.splice(this.callbacks.indexOf(callback), 1);
  }

  /**
   * Check if a function is currently in the animation loop.
   * @param { Function } callback  Function to check.
   */
  has(callback) {
    return this.callbacks.includes(callback);
  }

  /*---------------------------------------------------------------------------/
    Ticks
  /---------------------------------------------------------------------------*/

  onAnimationFrame() {
    if (this.playing) requestAnimationFrame(this.onAnimationFrame);
    else return;

    const now = time.now();
    const delta = Math.min(now - this._last, this.maxDelta);
    this._last = now;
    this.time += delta;

    // FPS uncapped
    if (this.fps === 0) return this.tick(delta);

    // FPS cap + offset
    this._frameProgress += delta;
    const frameRemaining = this._frameDuration - this._frameProgress;
    if (frameRemaining <= 0) {
      this._frameProgress = Math.abs(frameRemaining) % this._frameDuration;
      this.tick(this._frameDuration);
    }
  }

  tick(delta = 0) {
    this.callbacks.forEach((callback) => callback(delta, this.time));
  }

  /*---------------------------------------------------------------------------/
    Playback control
  /---------------------------------------------------------------------------*/

  reset() {
    this.time = 0;
  }

  start() {
    this._last = time.now();
    this._frameProgress = 0;
    this.playing = true;
    requestAnimationFrame(this.onAnimationFrame);
  }

  pause() {
    this.playing = false;
  }

  toggle() {
    if (this.playing) this.pause();
    else this.start();
  }

  stop() {
    this.pause();
    this.reset();
  }

  get fps() {
    return this._fps;
  }

  set fps(uint) {
    this._fps = uint;
    this._frameDuration = uint > 0 ? Math.round(1000 / uint) : 0;
  }
}

export { Ticker };
