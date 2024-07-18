import { clone, stringToKey } from 'kedan';

class Settings {
  /**
   * @param {Object} config Sketchpad config
   * @param {String} config.id Identifier used by the localStorage,
   * defaults to author-name
   * @param {String} config.name The title of the sketch
   * @param {String} config.date The sketch creation date
   * @param {String} config.author The author's name
   * @param {String} config.homepage The author's homepage URL
   * @param {String} config.github The project github
   * @param {Boolean} config.autoLoad Whether to load the settings automatically
   * on page load
   * @param {Boolean} config.autoSave Whether to save the settings automatically
   * on reset/change (needs to be applied manually)
   * @param {Object} config.background Can be either a hex number/string (flat
   * color object) or an options object for a special background, ex:
   * {type: 'linear', color1: '#ffffff', color2: '#000000'} for a black and white
   * linear gradient background).
   * @param {Object} config.camera Camera options
   * @param {Object} config.camera.start Camera starting position vector
   * (ex: {x: 1, y: 1, z: 1})
   * @param {Object} config.camera.lookAt Camera starting lookAt vector
   * (ex: {x: 0, y: 0, z: 0})
   * @param {Boolean/Object} config.pointer Either true or an options object
   * to add a PointerTracker control to the sketch
   * @param {Boolean/Object} config.cameraRig Either true or an options object
   * to add a CameraRig control to the sketch (incompatible with OrbitControls)
   * @param {Boolean/Object} config.orbit Either true or an options object
   * to add an OrbitControls to the sketch (incompatible with CameraRig)
   * @param {Boolean/Object} config.projector Either true or an options object
   * to add a PointerProjector control to the sketch
   * @param {Boolean} config.gui Whether to add a SketchGUI to the sketch
   * @param {Boolean} config.keyboard Whether to add a KeyboardShortcuts control
   * to the sketch
   * @param {Boolean} config.resizer Whether to add a CanvasResizer control
   * to the sketch
   * @param {Boolean} config.wheel Whether to add a mousewheel event listener
   * to the sketch
   * @param {Boolean} config.click Whether to add a click event listener
   * to the sketch
   * @param {Object} config.bloom Options object for a BloomPass
   * @param {Object} config.radialBlur Options object for a RadialBlurPass
   * @param {Object} config.fxaa Options object for a FXAAPass
   * @param {Boolean} config.output Whether to add an OutputPass
   * @param {Object} sketch Sketch settings unrelated to the sketchpad
   */
  constructor(
    // Sketchpad config
    {
      // Infos
      id,
      name = 'Untitled',
      date,
      author,
      homepage,
      github,
      // Setup
      autoLoad,
      autoSave,
      background,
      camera = { start: undefined, lookAt: undefined },
      // Controls
      pointer,
      cameraRig,
      orbit,
      projector,
      gui,
      keyboard,
      resizer,
      wheel,
      click,
      // Effects
      bloom,
      radialBlur,
      fxaa,
      output,
    } = {},
    sketch = {}
  ) {
    const config = arguments[0];
    if (!config.id)
      config.id = (function getAutoId() {
        const author = config.author || 'sketch';
        const name = config.name || 'settings';
        return `${stringToKey(author)}-${stringToKey(name)}`;
      })();
    this.config = config;
    this.sketch = sketch;
    this.defaults = {
      config: clone(config),
      sketch: clone(sketch),
    };
    if (config.autoLoad) this.load();
  }

  reset() {
    this.config = clone(this.defaults.config);
    this.sketch = clone(this.defaults.sketch);
    if (this.config.autoSave) this.save();
  }

  save() {
    const { config, sketch } = this;
    localStorage.setItem(config.id, JSON.stringify({ config, sketch }));
  }

  load() {
    const settings = JSON.parse(localStorage.getItem(this.config.id));
    if (!settings) return;
    const { config, sketch } = settings;
    Object.assign(this.config, config);
    Object.assign(this.sketch, sketch);
  }
}

export { Settings };
