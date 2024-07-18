import { WebGLRenderer } from 'three';
import {
  Disposable,
  Overlay,
  Ticker,
  getDeviceInfo,
  getElement,
  is,
  saveCanvasAsPNG,
} from 'kedan';

class Sketchpad extends Disposable {
  constructor({
    id,
    parent = document.body,
    renderer = {
      powerPreference: 'high-performance',
      stencil: false,
    },
    autoStart = true,
    autoTitle = true,
    autoFooter = true,
    overlay = true,
    debug = false,
    fps = 60,
    width,
    height,
    stats,
  } = {}) {
    super();

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
    this.parent = getElement(parent);
    const domElement = document.createElement('div');
    if (id) domElement.setAttribute('id', id);
    domElement.classList.add('sketchpad');
    domElement.appendChild(this.canvas);
    if (overlay) {
      const overlay = document.createElement('div');
      overlay.classList.add('sketchpad-overlay');
      domElement.appendChild(overlay);
      this.overlay = new Overlay(overlay, stats || debug);
    }
    this.parent.appendChild(domElement);
    this.domElement = domElement;

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
    this.onResize = undefined;
    this.ticker.stop();
    super.dispose();
    this.sketch.dispose();
    this.renderer.dispose();
    this.parent.removeChild(this.domElement);
  }

  open(sketch) {
    return new Promise(async (resolve) => {
      await sketch.preload();
      sketch.init(this);
      this.sketch = sketch;
      if (this.autoTitle) document.title = this.getAutoTitle();
      if (this.autoFooter) {
        if (is.string(this.autoFooter)) this.overlay.setFooter(this.autoFooter);
        else this.overlay?.setAutoFooter(sketch.settings.config);
      }
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

  getAutoTitle(separator = ' - ') {
    if (is.string(this.autoTitle)) return this.autoTitle;
    if (!this.sketch) return 'Sketchpad';
    const { author, name } = this.sketch.settings?.config;
    return author ? `${name}${separator}${author}` : name || 'Untitled Sketch';
  }
}

export { Sketchpad };
