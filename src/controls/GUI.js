import LilGUI from 'lil-gui';
import { stringToKey } from 'kedan';

class GUI extends LilGUI {
  constructor(sketch, options) {
    const container = sketch.sketchpad.overlay?.domElement;
    const title = sketch.name.toUpperCase();

    super({ container, title, ...options });

    this.sketch = sketch;
    if (!sketch.sketchpad.device.largeScreen) this.close();
  }

  get(folder) {
    if (folder instanceof GUI) return folder;
    if (this[folder]) return this[folder];
    return console.error('invalid folder:', folder);
  }

  addFolder(name, parentFolder) {
    const key = stringToKey(name);
    if (this[key]) return console.error('existing key:', key);

    const folder = parentFolder
      ? this.get(parentFolder).addFolder(name)
      : super.addFolder(name);

    this[key] = folder;
    return folder;
  }

  refresh(folder) {
    const target = this.get(folder);
    target
      .controllersRecursive()
      .forEach((controller) => controller.updateDisplay());
  }

  clear(folder) {
    const target = this.get(folder);
    target.controllersRecursive().forEach((controller) => controller.destroy());
  }
}

export { GUI };
