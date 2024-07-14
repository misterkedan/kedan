const tokens = {
  color: '<c>',
  font: '<f>',
  opacity: '<o>',
  opacityDisabled: '<od>',
  opacityHover: '<oh>',
  padding: '<p>',
  size: '<s>',
};

const css = /*css*/ `
.wrapper {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	text-align: center;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.arrow {
	pointer-events: initial;
	cursor: pointer;
	user-select: none;
	-webkit-touch-callout: none;
	-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	-webkit-tap-highlight-color: transparent;
	font-family: ${tokens.font};
	font-size: ${tokens.size};
	padding: ${tokens.padding};
	color: ${tokens.color};
	opacity: ${tokens.opacity};
}

.arrow:hover {
	opacity: ${tokens.opacityHover};
}

.arrow.disabled,
.arrow.disabled:hover {
	opacity: ${tokens.opacityDisabled};
	pointer-events: none;
}

.wrapper.vertical {
	flex-direction: column;
}

.wrapper.vertical .arrow {
	transform: rotate(90deg);
}
`;

class NavigationArrows {
  constructor({
    prefix = 'swiper',
    container = document.body,
    backHTML = '&#10094;',
    forwardHTML = '&#10095;',
    injectStyles = true,

    // Style settings
    font = 'monospace',
    size = '2.4rem',
    padding = '0.2em 0.7em',
    color = 'white',
    opacity = 0.4,
    opacityDisabled = 0,
    opacityHover = 0.9,
  } = {}) {
    Object.assign(this, { prefix, container, backHTML, forwardHTML });

    this.cssSettings = {
      font,
      size,
      padding,
      color,
      opacity,
      opacityDisabled,
      opacityHover,
    };

    this.build();

    if (injectStyles) this.injectStyles();
  }

  build() {
    const div = 'div';

    const wrapper = document.createElement(div);
    wrapper.classList.add(this.classes.wrapper);

    const back = document.createElement(div);
    back.classList.add(this.classes.arrow, this.classes.back);
    back.innerHTML = '&#10094;';

    const forward = document.createElement(div);
    forward.classList.add(this.classes.arrow, this.classes.forward);
    forward.innerHTML = '&#10095;';

    wrapper.appendChild(back);
    wrapper.appendChild(forward);
    this.container.appendChild(wrapper);

    this.wrapper = wrapper;
    this.back = back;
    this.forward = forward;
  }

  injectStyles() {
    const style = document.createElement('style');

    const cssSettings = Object.entries(this.cssSettings);
    style.innerHTML = cssSettings.reduce(
      (acc, [key, value]) => {
        return acc.replaceAll(tokens[key], value);
      },
      css
        .replaceAll('wrapper', this.classes.wrapper)
        .replaceAll('arrow', this.classes.arrow)
    );

    document.getElementsByTagName('head')[0].appendChild(style);
  }

  bind(onBack, onForward) {
    if (onBack) {
      this.onBack = onBack;
      this.back.addEventListener('click', this.onBack);
    }

    if (onForward) {
      this.onForward = onForward;
      this.forward.addEventListener('click', this.onForward);
    }
  }

  dispose() {
    this.back.removeEventListener('click', this.onBack);
    this.forward.removeEventListener('click', this.onForward);
    this.onBack = undefined;
    this.onForward = undefined;

    this.container.removeChild(this.wrapper);
    this.wrapper.removeChild(this.back);
    this.wrapper.removeChild(this.forward);

    this.wrapper = undefined;
    this.back = undefined;
    this.forward = undefined;
  }

  disable(back = false, forward = false) {
    const disabled = 'disabled';

    if (back) this.back.classList.add(disabled);
    else this.back.classList.remove(disabled);

    if (forward) this.forward.classList.add(disabled);
    else this.forward.classList.remove(disabled);
  }

  /*---------------------------------------------------------------------------/
		Getters & Setters
	/---------------------------------------------------------------------------*/

  get prefix() {
    return this._prefix;
  }

  set prefix(string) {
    this._prefix = string;

    this.classes = {
      wrapper: string ? `${string}-wrapper` : 'wrapper',
      arrow: string ? `${string}-arrow` : 'arrow',
      back: string ? `${string}-back` : 'back',
      forward: string ? `${string}-forward` : 'forward',
    };
  }

  get horizontal() {
    return !this.wrapper.classList.contains('vertical');
  }

  set horizontal(boolean) {
    if (boolean) this.wrapper.classList.remove('vertical');
    else this.wrapper.classList.add('vertical');
  }
}

export { NavigationArrows };
