import GUI from 'lil-gui';
import { logInvalidArgument, stringToKey } from 'kedan';

class SketchGUI extends GUI {
  constructor(sketch, options) {
    const container = sketch.sketchpad.overlay?.domElement;
    const title = sketch.name.toUpperCase();

    super({ container, title, ...options });

    this.domElement.classList.add('sketchpad-gui');
    this.sketch = sketch;
    if (!sketch.sketchpad.device.largeScreen) this.close();
  }

  get(folder) {
    if (folder instanceof GUI) return folder;
    if (this[folder]) return this[folder];
    if (folder) return logInvalidArgument(folder);
    return this;
  }

  addFolder(name, parentFolder) {
    const key = stringToKey(name);
    if (this[key]) return logNameTaken(name);

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

export { SketchGUI };
