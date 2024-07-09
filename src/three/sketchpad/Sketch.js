import { Object3D } from 'three';
import { BloomPass, Effects, FXAAPass, RadialBlurPass, Stage } from 'kedan';

class Sketch {
  constructor(controlsClass, settings) {
    this.controls = new controlsClass();
    this.settings = settings;
  }

  preload() {
    // Preload files here
  }

  initSketchpad(sketchpad) {
    this.sketchpad = sketchpad;
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

  init() {
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
      value?.dispose?.();
      delete this[key];
    });
  }

  /*-------------------------------------------------------------------------/

		Update

	/-------------------------------------------------------------------------*/

  dispose() {
    this.stage.dispose();
    this.effects.dispose();
    this.controls.dispose();
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
    return this.settings.sk3tch;
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

  // Sketchpad

  get canvas() {
    return this.sketchpad.canvas;
  }

  get container() {
    return this.sketchpad.container;
  }

  get device() {
    return this.sketchpad.device;
  }

  get ticker() {
    return this.sketchpad.ticker;
  }

  get overlay() {
    return this.sketchpad.overlay;
  }
}

export { Sketch };
