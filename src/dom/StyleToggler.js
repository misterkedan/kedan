import { elementsArrayFrom } from 'kedan';

class StyleToggler {
  constructor(elements = [], properties = {}, enabled = false) {
    this.elements = elementsArrayFrom(elements);
    this.properties = properties;
    this._enabled = enabled;
  }

  enable() {
    Object.entries(this.properties).forEach(([key, value]) => {
      this.elements.forEach((element) => (element.style[key] = value[1]));
    });

    this._enabled = true;
  }

  disable() {
    Object.entries(this.properties).forEach(([key, value]) => {
      this.elements.forEach((element) => (element.style[key] = value[0]));
    });

    this._enabled = false;
  }

  toggle() {
    this.enabled = !this.enabled;
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(value) {
    if (value === this._enabled) return;

    if (value) this.enable();
    else this.disable();
  }
}

export { StyleToggler };
