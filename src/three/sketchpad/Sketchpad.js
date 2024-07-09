import { WebGLRenderer } from 'three';
import {
  Overlay,
  Ticker,
  getDeviceInfo,
  getElement,
  saveCanvasAsPNG,
} from 'kedan';

class Sketchpad {
  constructor({
    container = 'sketchpad',
    overlay = 'sketchpad-overlay',
    renderer = {
      powerPreference: 'high-performance',
      stencil: false,
    },
    autoStart = true,
    autoTitle = true,
    autoFooter = true,
    debug = false,
    fps = 60,
    width,
    height,
    stats,
  } = {}) {
    this.autoStart = autoStart;
    this.autoTitle = autoTitle;
    this.autoFooter = autoFooter;
    this.debug = debug;

    // Core
    this.device = getDeviceInfo();
    this.renderer =
      renderer instanceof WebGLRenderer
        ? renderer
        : new WebGLRenderer(renderer);
    this.canvas = this.renderer.domElement;
    this.canvas.classList.add('sketchpad-canvas');
    this.ticker = new Ticker(this.tick.bind(this), fps);

    // DOM
    this.container = getElement(container);
    this.container.appendChild(this.canvas);
    if (overlay) {
      overlay = getElement(overlay, this.container);
      this.overlay = new Overlay(overlay, stats || debug);
    }

    // Size
    this.width = width;
    this.height = height;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(this.pixelRatio);

    // Init
    this.resize();
    this.bind();
  }

  bind() {
    this.onResize = function () {
      this.needsResize = true;
    }.bind(this);

    window.addEventListener('resize', this.onResize);
  }

  dispose() {
    window.removeEventListener('resize', this.onResize);
    this.onResize = null;
  }

  open(sketch) {
    return new Promise(async (resolve) => {
      await sketch.preload();
      sketch.initSketchpad(this);
      sketch.init();
      this.sketch = sketch;

      if (this.autoTitle) document.title = sketch.autoTitle;
      if (this.autoFooter) this.overlay?.setAutoFooter(sketch);
      if (this.autoStart) this.start();

      resolve();
    });
  }

  start(time = 0) {
    this.needsResize = true;

    this.ticker.time = time;
    this.ticker.start();
  }

  resize(width = this.width, height = this.height) {
    this.width = width;
    this.height = height;
    if (!width) width = window.innerWidth;
    if (!height) height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.sketch?.resize(width, height, this.pixelRatio);

    this.needsResize = false;
  }

  tick(delta, time) {
    if (this.needsResize) this.resize();

    this.sketch?.tick(delta, time);
    this.overlay?.tick();

    if (this.savePNGRequested) {
      saveCanvasAsPNG(this.canvas, this.sketch.name);
      this.savePNGRequested = false;
    }
  }

  savePNG() {
    if (!this.sketch) return;

    this.savePNGRequested = true;
    if (!this.ticker.playing) this.ticker.tick();
  }
}

export { Sketchpad };
