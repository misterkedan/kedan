import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {
  CameraRig,
  CanvasResizer,
  KeyboardShortcuts,
  PointerProjector,
  PointerTracker,
  SketchGUI,
} from 'kedan';

class Controls {
  init(sketch) {
    this.sketch = sketch;
    this.settings = sketch.settings;
    this.sketchpad = sketch.sketchpad;

    const {
      resizer,
      orbit,
      pointer,
      projector,
      cameraRig,
      gui,
      keyboard,
      click,
      wheel,
    } = sketch.config;
    const desktop = !sketch.sketchpad.device.phone;

    if (resizer) this.initResizer();
    if (orbit) this.initOrbit(orbit);

    if (pointer) this.initPointer(pointer);
    if (projector) this.initProjector(projector);
    if (cameraRig) this.initCameraRig(cameraRig);

    if (gui && (desktop || sketch.debug)) this.initGUI(gui);
    if (keyboard && desktop) this.initKeyboard();
    if (wheel && desktop) this.initWheel();
    if (click) this.initClick();
  }

  initResizer() {
    const resizer = new CanvasResizer(this.sketchpad.canvas);
    resizer.onResize = () =>
      this.sketchpad.resize(resizer.width, resizer.height);
    this.resizer = resizer;
  }

  initOrbit(options) {
    this.orbit = new OrbitControls(this.sketch.camera, this.sketchpad.canvas);
    Object.assign(this.orbit, options);
  }

  initPointer(options) {
    this.pointer = new PointerTracker(options);
  }

  initProjector(options) {
    this.projector = new PointerProjector(this.sketch, options);

    if (!this.pointer) this.initPointer();
  }

  initCameraRig(options) {
    if (this.orbit) return console.error('Camera used by:', this.orbit);

    const { camera } = this.sketch;
    const { bounds, speed, intro } = options;
    const lookAt = options.lookAt || this.settings.sketchpad.camera.lookAt;

    this.cameraRig = new CameraRig({ camera, lookAt, bounds, speed, intro });

    if (!this.pointer) this.initPointer();
  }

  initGUI(options) {
    this.gui = new SketchGUI(this.sketch, options);
  }

  initKeyboard(bindings = {}, debug) {
    this.keyboardShortcuts = new KeyboardShortcuts({ bindings });
    this.keyboardShortcuts.debug = debug;
  }

  initClick(onClick) {
    this.onClick =
      onClick ||
      function (event) {
        console.log('Controls.onClick', event);
      }.bind(this);

    this.sketchpad.canvas.addEventListener('click', this.onClick);
    this.sketchpad.canvas.style.cursor = 'pointer';
  }

  initWheel(onWheel) {
    this.onWheel =
      onWheel ||
      function (event) {
        console.log('Controls.onWheel:', event);
      };

    this.sketchpad.canvas.addEventListener('wheel', this.onWheel);
  }

  /*-------------------------------------------------------------------------/
		Update
	/-------------------------------------------------------------------------*/

  dispose() {
    this.pointer?.dispose();
    this.projector?.dispose();
    this.keyboardShortcuts?.dispose();
    this.resizer?.dispose();
    this.gui?.destroy();

    this.sketchpad.canvas.removeEventListener('click', this.onClick);
    this.sketchpad.canvas.removeEventListener('wheel', this.onWheel);
    this.onClick = null;
    this.onWheel = null;
  }

  resize(width, height) {
    this.pointer?.resize(width, height);
  }

  tick(delta) {
    if (this.orbit?.autoRotate) this.orbit.update();

    if (!this.pointer?.enabled) return;

    this.cameraRig?.set(this.pointer.xSignFlip, this.pointer.y);
    this.cameraRig?.tick(delta);

    this.projector?.set(this.pointer.xSign, this.pointer.ySignFlip);
    this.projector?.tick(delta);
  }
}

export { Controls };
