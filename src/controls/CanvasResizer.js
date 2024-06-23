import { Presentation } from 'kedan';

class CanvasResizer {
  constructor(
    canvas,
    {
      presets = [
        { name: 'AUTO', width: 0, height: 0 },
        { name: '480p', width: 720, height: 480 },
        { name: '720p', width: 1280, height: 720 },
        { name: '1080p', width: 1920, height: 1080 },
        { name: '2K', width: 2560, height: 1440 },
        { name: '4K', width: 3840, height: 2160 },
        { name: 'Facebook', width: 1200, height: 630 },
        { name: 'Instagram', width: 1080, height: 1080 },
        { name: 'Pinterest', width: 1000, height: 1500 },
        { name: 'Twitter', width: 1200, height: 675 },
      ],

      zooms = [2.5, 5, 10, 25, 50, 75, 100, 150, 200, 400, 800],
      defaultZoom = 100,

      keyboardEvents = true,
      zoomInKeys = '+',
      zoomOutKeys = '-',
      autoKeys = '*',

      onResize,
    } = {}
  ) {
    this.canvas = canvas;
    this.onResize = onResize;
    this._width = 0;
    this._height = 0;

    if (presets) this.initPresets(presets);
    if (zooms) this.initZoom(zooms, defaultZoom);
    if (keyboardEvents)
      this.bind([...zoomInKeys], [...zoomOutKeys], [...autoKeys]);
  }

  /*---------------------------------------------------------------------------/
		Size
	/---------------------------------------------------------------------------*/

  initPresets(items) {
    const presets = new Presentation({ items });
    presets.onChange = () =>
      this.resize(presets.item.width, presets.item.height);
    this.presets = presets;
  }

  resize(width = this.width, height = this.height) {
    this._width = width;
    this._height = height;

    if (!width) width = window.innerWidth;
    if (!height) height = window.innerHeight;

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.onResize?.();
  }

  auto() {
    this.zooms.goto(this.defaultIndex);
    this.resize();
  }

  /*---------------------------------------------------------------------------/
		Zoom
	/---------------------------------------------------------------------------*/

  initZoom(items, defaultItem) {
    this.defaultIndex = Math.max(items.indexOf(defaultItem), 0);

    const startAt = this.defaultIndex;
    const onChange = () => this.applyZoom();

    this.zooms = new Presentation({
      items,
      startAt,
      onChange,
    });
  }

  applyZoom(zoom = this.zooms.item) {
    this.canvas.style.transform = `scale( ${zoom * 0.01} )`;
  }

  zoomIn() {
    this.zooms.forward();
  }

  zoomOut() {
    this.zooms.back();
  }

  /*---------------------------------------------------------------------------/
    Events
  /---------------------------------------------------------------------------*/

  bind(zoomInKeys, zoomOutKeys, autoKeys) {
    this.onKeyUp = function (event) {
      if (autoKeys.includes(event.key)) return this.auto();
      if (zoomInKeys.includes(event.key)) return this.zoomIn();
      if (zoomOutKeys.includes(event.key)) return this.zoomOut();
    }.bind(this);

    window.addEventListener('keyup', this.onKeyUp);
  }

  dispose() {
    window.removeEventListener('keyup', this.onKeyUp);
    this.onKeyUp = null;
  }

  /*---------------------------------------------------------------------------/
    Getters & Setters
  /---------------------------------------------------------------------------*/

  get width() {
    return this._width;
  }

  set width(uint) {
    this._width = uint;
    this.resize(uint);
  }

  get height() {
    return this._height;
  }

  set height(uint) {
    this._height = uint;
    this.resize(this.width, uint);
  }

  get preset() {
    return this.presets.item.name;
  }

  set preset(name) {
    const item = this.presets.items.find((item) => item.name === name);
    if (item) this.presets.item = item;
  }

  get zoom() {
    return this.zooms.item;
  }

  set zoom(number) {
    if (this.zooms.items.includes(number)) this.zooms.item = number;
    else {
      this.zooms.goto(this.defaultIndex, false);
      this.applyZoom(number);
    }
  }
}

export { CanvasResizer };
