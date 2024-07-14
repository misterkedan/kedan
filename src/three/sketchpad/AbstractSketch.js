import { Object3D } from 'three';
import {
  BloomPass,
  Disposable,
  Effects,
  FXAAPass,
  RadialBlurPass,
  Stage,
  dispose,
} from 'kedan';

class AbstractSketch extends Disposable {
  constructor({ controls, settings } = {}) {
    super();
    this.controls = controls;
    this.settings = settings;
  }

  preload() {
    // Preload files here
  }

  initStage() {
    const stage = new Stage(this.config);
    this.stage = stage;
    this.scene = stage.scene;
    this.camera = stage.camera;
    this.background = stage.background;
  }

  initScene() {
    // Build scene here in subclasses
  }

  initControls() {
    this.controls.init(this);
  }

  initEffects() {
    const { camera, scene } = this.stage;
    const { renderer } = this.sketchpad;
    const { renderToScreen, bloom, fxaa, radialBlur } = this.config;
    this.effects = new Effects({ camera, scene, renderer, renderToScreen });

    if (fxaa) this.effects.add('fxaa', new FXAAPass(fxaa));
    if (bloom) this.effects.add('bloom', new BloomPass(bloom));
    if (radialBlur)
      this.effects.add('radialBlur', new RadialBlurPass(radialBlur));
  }

  init(sketchpad = this.sketchpad) {
    this.sketchpad = sketchpad;
    this.initStage();
    this.initEffects();
    this.initScene();
    this.initControls();
  }

  /*-------------------------------------------------------------------------/
		Stage shortcutss
	/-------------------------------------------------------------------------*/

  add(input) {
    if (input instanceof Object3D) return this.stage.add(input);

    Object.entries(input).forEach(([key, value]) => {
      this[key] = value;
      this.stage.add(value);
    });
  }

  remove(input) {
    if (input instanceof Object3D) return this.stage.remove(input);

    Object.entries(input).forEach(([key, value]) => {
      this.stage.remove(value);
      this[key] = dispose(value);
    });
  }

  /*-------------------------------------------------------------------------/
		Update
	/-------------------------------------------------------------------------*/

  dispose() {
    this.sketchpad = null;
    super.dispose();
  }

  reset() {
    const { sketchpad } = this;
    this.settings.reset();
    this.dispose();
    this.init(sketchpad);
    sketchpad.resize();
  }

  resize(width, height, pixelRatio) {
    this.stage.resize(width, height);
    this.controls.resize(width, height);
    this.effects.resize(width, height, pixelRatio);
  }

  tick(delta, time) {
    this.controls.tick(delta, time);
    this.effects.tick(delta, time);
  }

  /*-------------------------------------------------------------------------/
		Read-only
	/-------------------------------------------------------------------------*/

  get aspect() {
    return this.camera.aspect;
  }
  get output() {
    return this.effects.composer.readBuffer.texture;
  }
  get sfx() {
    return this.effects.passes;
  }

  // Config
  get config() {
    return this.settings.sketchpad;
  }
  get author() {
    return this.config.author;
  }
  get name() {
    return this.config.name || 'Untitled';
  }
  get autoTitle() {
    return this.author ? `${this.name} - ${this.author}` : this.name;
  }
}

export { AbstractSketch };
