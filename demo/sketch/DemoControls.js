import { Color } from 'three';
import {
  Controls,
  LinearGradientBackground,
  RadialGradientBackground,
  SimplexGradientBackground,
  Swiper,
} from 'kedan';

class DemoControls extends Controls {
  /*---------------------------------------------------------------------------/
		Overrides
	/---------------------------------------------------------------------------*/

  init(sketch) {
    super.init(sketch);

    this.initSwiper();
  }

  initGUI() {
    super.initGUI();
    const { gui, sketch } = this;

    // Size
    const presets = this.resizer.presets.items.map((preset) => preset.name);
    const size = gui.addFolder('SIZE');
    size.add(this.resizer, 'preset', presets);
    size.add(this.resizer, 'width', 0, 3840, 1).listen();
    size.add(this.resizer, 'height', 0, 2160, 1).listen();
    size.add(this.resizer, 'zoom', this.resizer.zooms.items).listen();

    // Background
    gui.addFolder('BACKGROUND');

    // SFX
    const sfx = gui.addFolder('POST-PROCESSING');

    const fxaa = gui.addFolder('FXAA', sfx);
    fxaa.add(sketch.sfx.fxaa, 'enabled');

    const bloom = gui.addFolder('BLOOM', sfx);
    bloom.add(sketch.sfx.bloom, 'strength', 0, 1);
    bloom.add(sketch.sfx.bloom, 'radius', 0, 1);
    bloom.add(sketch.sfx.bloom, 'threshold', 0, 1).listen();
    bloom.add(sketch.sfx.bloom, 'enabled');

    const radialBlur = gui.addFolder('RADIAL BLUR', sfx);
    radialBlur.add(sketch.sfx.radialBlur, 'strength', 0, 1);
    radialBlur.add(sketch.sfx.radialBlur, 'enabled');

    // Controls
    const controls = gui.addFolder('CONTROLS');
    controls.add(this.sketchpad.ticker, 'fps', 0, 60, 1);
    controls.add(this.pointer, 'enabled').name('pointerTracking');
    controls.add(this, 'dither');
    controls.add(this.sketchpad, 'savePNG');
    controls.add(this.sketchpad.ticker, 'toggle').name('play / pause');
  }

  initKeyboard() {
    super.initKeyboard({
      //all: () => console.log('any key'),
      //unbound: () => console.log('unbound key'),
      'Shift + O': () => this.sketchpad.overlay?.visibility.toggle(),
      'Shift + P': () => this.sketchpad.ticker.toggle(),
      'Shift + S': () => this.sketchpad.savePNG(),
    });
  }

  tick(delta) {
    super.tick(delta);

    const computeRotation = () => {
      const defaultRotation = -0.001;

      if (!this.pointer.enabled) return defaultRotation;

      const rotation = -this.pointer.xSign * 0.002;
      const sign = rotation > 0 ? -1 : 1;
      const smallRotation = Math.abs(rotation) < Math.abs(defaultRotation);

      return smallRotation ? sign * defaultRotation : rotation;
    };

    this.sketch.rotationSpeed = computeRotation();
  }

  dispose() {
    super.dispose();

    this.swiper.dispose();
  }

  /*---------------------------------------------------------------------------/
		Demo
	/---------------------------------------------------------------------------*/

  initSwiper() {
    this.backgroundFactory = {
      flat: () => new Color('#ff7700'),
      linear: () =>
        new LinearGradientBackground({
          color1: '#0055aa',
          color2: '#030030',
        }),
      radial: () =>
        new RadialGradientBackground({
          color1: '#ff0000',
          color2: '#000000',
        }),
      simplex: () =>
        new SimplexGradientBackground({
          color1: '#ff0000',
          color2: '#0000ff',
          color3: '#00cccc',
          color4: '#ffff00',
          noiseScale: 0.8,
        }),
    };

    const items = Object.keys(this.backgroundFactory);
    const container = this.sketchpad.overlay?.domElement || document.body;
    const dispatcher = this.sketchpad.canvas;

    const onChange = () => (this.background = this.swiper.item);
    this.swiper = new Swiper({
      items,
      dispatcher,
      onChange,
      arrows: { container },
      loop: true,
    });

    this.swiper.goto(1);
  }

  onBackgroundChange() {
    const { gui, sketch } = this;
    const { background } = sketch;
    const { item } = this.swiper;

    // Bloom

    const thresholds = {
      flat: 0.996,
      linear: 0.3,
      radial: 0.996,
      simplex: 0.997,
    };
    sketch.sfx.bloom.threshold = thresholds[item];

    // GUI

    if (!gui) return;

    gui.clear(gui.background);
    gui.background
      .add(this.swiper, 'item', this.swiper.items)
      .name('type')
      .listen();

    if (background instanceof Color) {
      gui.background.addColor(sketch, 'background').name('color');
      return;
    }

    gui.background.addColor(background, 'color1');
    gui.background.addColor(background, 'color2');

    const optionalControls = {
      linear: () => gui.background.add(background, 'angle', 0, 360, 1),
      radial: () => gui.background.add(background, 'radius', 0.5, 2),
      simplex: () => {
        gui.background.addColor(background, 'color3');
        gui.background.addColor(background, 'color4');
        gui.background.add(background, 'noiseScale', 0.1, 1);
      },
    };

    optionalControls[item]?.();
  }

  /*---------------------------------------------------------------------------/
		Getters & Setters
	/---------------------------------------------------------------------------*/

  get background() {
    return this.swiper.item;
  }
  set background(string) {
    this.sketch.clearBackground();

    const background = this.backgroundFactory[string]();
    this.sketch.setBackground(background);

    this.onBackgroundChange();
  }

  get dither() {
    return this.sketch.sfx.bloom.dither;
  }
  set dither(boolean) {
    this.sketch.background.dither = boolean;
    this.sketch.sfx.bloom.dither = boolean;
    this.sketch.sfx.radialBlur.dither = boolean;
  }
}

export { DemoControls };
