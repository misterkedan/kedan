class Presentation {
  constructor({
    items = [],
    loop = false,
    debug = false,
    startAt = 0,
    onBegin,
    onChange,
    onComplete,
    initCallback = false,
  } = {}) {
    Object.assign(this, {
      items,
      loop,
      debug,
      onBegin,
      onChange,
      onComplete,
    });

    this.goto(Math.max(startAt, 0), initCallback);
  }

  back() {
    if (this.isStarting) {
      if (!this.loop) return;
      return (this.index = this.lastIndex);
    }

    this.index--;
  }

  forward() {
    if (this.isEnding) {
      if (!this.loop) return;
      return (this.index = 0);
    }

    this.index++;
  }

  goto(index, trigger = true) {
    if (index === this._index) return;

    this._index = index;
    this._item = this.items[index];

    if (this.debug) {
      const { index, item } = this;
      console.log({ index, item });
    }

    if (!trigger) return;
    if (this.onChange) this.onChange();
    if (this.onBegin && this.isStarting) this.onBegin();
    if (this.onComplete && this.isEnding) this.onComplete();
  }

  /*---------------------------------------------------------------------------/
    Getters & Setters
  /---------------------------------------------------------------------------*/

  get index() {
    return this._index;
  }

  set index(uint) {
    this.goto(uint);
  }

  get item() {
    return this._item;
  }

  set item(item) {
    const index = this.items.indexOf(item);
    if (index >= 0) this.goto(index);
  }

  /*---------------------------------------------------------------------------/
    Read-only
  /---------------------------------------------------------------------------*/

  get callback() {
    if (this.isStarting) return this.onBegin;
    if (this.isEnding) return this.onComplete;
    return this.onChange;
  }

  get length() {
    return this.items.length;
  }

  get lastIndex() {
    return this.items.length - 1;
  }

  get isStarting() {
    return this.index === 0;
  }

  get isEnding() {
    return this.index === this.lastIndex;
  }
}

export { Presentation };
