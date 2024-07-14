import { getKeyboardBinding } from 'kedan';

class KeyboardShortcuts {
  constructor({ bindings = {}, enabled = true, debug = false } = {}) {
    this.bindings = bindings;
    this.enabled = enabled;
    this.debug = debug;

    this.bind();
  }

  bind() {
    this.onKeyUp = function (event) {
      if (!this.enabled) return;
      if (event.key in ['Control', 'Alt', 'Shift']) return;

      this.bindings.all?.(event);

      const keyBinding = getKeyboardBinding(event);
      const bound = this.bindings[keyBinding];
      if (bound) return bound(event);
      if (this.debug) console.log({ key: event.key, keyBinding });

      this.bindings.unbound?.(event);
    }.bind(this);

    window.addEventListener('keyup', this.onKeyUp);
  }

  dispose() {
    window.removeEventListener('keyup', this.onKeyUp);
    this.onKeyUp = undefined;
  }
}

export { KeyboardShortcuts };
